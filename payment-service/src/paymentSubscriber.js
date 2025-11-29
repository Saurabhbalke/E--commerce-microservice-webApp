const { consumeMessages, publishMessage, getChannel } = require('../../shared/utils/rabbitMQ');
const Payment = require('./models/Payment');

const ORDER_CREATED_QUEUE = 'payment_order_created_queue';

/**
 * Mock function to process payment.
 * In a real app, this would call Stripe, Razorpay, etc.
 * It will randomly fail 10% of the time.
 */
function mockPaymentProcessor(amount) {
  return new Promise((resolve, reject) => {
    console.log(`Processing payment for ${amount}...`);
    setTimeout(() => {
      if (Math.random() < 0.1) { // 10% failure rate
        console.log('Payment FAILED (mock)');
        reject(new Error('Insufficient funds (mock)'));
      } else {
        console.log('Payment PROCESSED (mock)');
        resolve({ transactionId: `txn_${Math.random().toString(36).substr(2, 9)}` });
      }
    }, 1500); // Simulate network delay
  });
}

/**
 * Handles the 'order.created' event.
 */
async function handleOrderCreated(msg) {
  const channel = getChannel();
  let message;
  try {
    message = JSON.parse(msg.content.toString());
    const { orderId, userId, totalAmount } = message;
    console.log(`[p] Received order.created event for Order ID: ${orderId}`);

    // Idempotency check: has this payment already been processed?
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment && existingPayment.status !== 'PENDING') {
      console.log(`[p] Payment for Order ${orderId} already processed with status: ${existingPayment.status}. Skipping.`);
      
      // Re-publish the result for safety
      if (existingPayment.status === 'PROCESSED') {
        publishMessage('payment.processed', { orderId, status: 'SUCCESS', transactionId: existingPayment.transactionId });
      } else if (existingPayment.status === 'FAILED') {
        publishMessage('payment.failed', { orderId, status: 'FAILED', reason: 'Payment failed' });
      }
      
      channel.ack(msg);
      return;
    }

    // 1. Create a PENDING payment record (or use existing if already PENDING)
    let payment = existingPayment;
    if (!payment) {
      payment = new Payment({
        orderId,
        userId,
        amount: totalAmount,
        status: 'PENDING',
      });
      await payment.save();
    }

    // 2. Process the payment
    try {
      const paymentResult = await mockPaymentProcessor(totalAmount);
      
      // 3. Payment Success
      await Payment.updateOne(
        { orderId },
        { $set: { status: 'PROCESSED', transactionId: paymentResult.transactionId }}
      );
      
      // Publish the success reply
      publishMessage('payment.processed', { orderId, status: 'SUCCESS', transactionId: paymentResult.transactionId });
      console.log(`[p] Payment processed for Order ID: ${orderId}`);

    } catch (paymentError) {
      // 4. Payment Failure
      await Payment.updateOne(
        { orderId },
        { $set: { status: 'FAILED' }}
      );
      
      // Publish the failure reply
      publishMessage('payment.failed', { orderId, status: 'FAILED', reason: paymentError.message });
      console.log(`[p] Payment FAILED for Order ID: ${orderId}. Reason: ${paymentError.message}`);
    }

    // Acknowledge the message was processed
    channel.ack(msg);

  } catch (error) {
    console.error('Error processing payment:', error, message);
    channel.nack(msg, false, false); 
  }
}

function startPaymentSubscriber() {
  // Listen for new orders
  consumeMessages(ORDER_CREATED_QUEUE, 'order.created', handleOrderCreated);
  
  // We don't need to listen for compensation, as 'money' is the source of truth.
  // A refund would be a separate, explicit business process.
}

module.exports = { startPaymentSubscriber };
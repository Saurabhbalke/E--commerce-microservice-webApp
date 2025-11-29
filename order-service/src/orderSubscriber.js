const { consumeMessages, getChannel, publishMessage } = require('../../shared/utils/rabbitMQ');
const Order = require('./models/Order');

const STOCK_REPLY_QUEUE = 'stock_reply_queue';
const PAYMENT_REPLY_QUEUE = 'payment_reply_queue';

/**
 * This function handles the core logic of the Saga.
 * It tracks the state of the order and decides when it's
 * 'CONFIRMED' or 'CANCELLED'.
 */
async function handleSagaMessage(msg) {
  const channel = getChannel();
  let message;
  try {
    message = JSON.parse(msg.content.toString());
    const { orderId } = message;

    if (!orderId) {
      console.warn('Message received without orderId. Acknowledging.');
      channel.ack(msg);
      return;
    }

    // --- Find the order ---
    // We use findOneAndUpdate to get atomicity
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'PENDING') {
      // Order already processed or doesn't exist
      console.warn(`Order ${orderId} not found or already processed. Acknowledging.`);
      channel.ack(msg);
      return;
    }

    // --- Update State based on event ---
    const routingKey = msg.fields.routingKey;
    let update = {};

    if (routingKey === 'stock.reserved') {
      update.stockStatus = 'RESERVED';
    } else if (routingKey === 'stock.reservation_failed') {
      update.stockStatus = 'FAILED';
      update.failureReason = message.reason;
    } else if (routingKey === 'payment.processed') {
      update.paymentStatus = 'PROCESSED';
    } else if (routingKey === 'payment.failed') {
      update.paymentStatus = 'FAILED';
      update.failureReason = message.reason;
    }

    // --- Atomically update the order state ---
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { $set: update }, { new: true });

    // --- Check if the Saga is complete ---
    await checkSagaCompletion(updatedOrder);

    // Acknowledge the message
    channel.ack(msg);

  } catch (error) {
    console.error('Error processing message:', error, message);
    // Nack to requeue (or dead-letter)
    channel.nack(msg, false, false); 
  }
}

/**
 * Checks the order's state to see if the saga is finished.
 * @param {Document} order - The Mongoose order document
 */
async function checkSagaCompletion(order) {
  if (order.status !== 'PENDING') return; // Already completed

  // --- Failure Condition ---
  if (order.stockStatus === 'FAILED' || order.paymentStatus === 'FAILED') {
    await Order.findByIdAndUpdate(order.id, { $set: { status: 'CANCELLED' } });
    console.log(`[SAGA] Order ${order.id} CANCELLED. Reason: ${order.failureReason}`);
    
    // Publish compensation events
    // Release stock if it was successfully reserved (regardless of which step failed)
    if (order.stockStatus === 'RESERVED') {
      // Tell inventory to release the stock
      publishMessage('stock.release', { orderId: order.id, items: order.items });
      console.log(`[SAGA] Releasing stock for Order ${order.id}`);
    }
    
    // Publish final event for notification
    publishMessage('order.cancelled', { orderId: order.id, userId: order.userId, reason: order.failureReason });
  }
  
  // --- Success Condition ---
  else if (order.stockStatus === 'RESERVED' && order.paymentStatus === 'PROCESSED') {
    await Order.findByIdAndUpdate(order.id, { $set: { status: 'CONFIRMED' } });
    console.log(`[SAGA] Order ${order.id} CONFIRMED.`);
    
    // Publish final event for notification
    publishMessage('order.confirmed', { orderId: order.id, userId: order.userId, totalAmount: order.totalAmount });
  }
}


function startOrderSubscriber() {
  // Listen for stock replies
  consumeMessages(STOCK_REPLY_QUEUE, 'stock.*', handleSagaMessage);
  
  // Listen for payment replies
  consumeMessages(PAYMENT_REPLY_QUEUE, 'payment.*', handleSagaMessage);
}

module.exports = { startOrderSubscriber };
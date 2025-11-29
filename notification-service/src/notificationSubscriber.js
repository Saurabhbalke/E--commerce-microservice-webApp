const { consumeMessages, getChannel, NOTIFICATION_QUEUE } = require('../../shared/utils/rabbitMQ');

/**
 * Mock function to "send an email".
 */
function sendEmail(to, subject, body) {
  console.log('--- SENDING EMAIL ---');
  console.log(`To: user-${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log('---------------------');
  return Promise.resolve();
}

/**
 * Handles final order status events.
 */
async function handleNotification(msg) {
  const channel = getChannel();
  let message;
  try {
    message = JSON.parse(msg.content.toString());
    const routingKey = msg.fields.routingKey;
    
    console.log(`[n] Received event: ${routingKey}`);

    if (routingKey === 'order.confirmed') {
      await sendEmail(
        message.userId,
        `Order Confirmed: #${message.orderId}`,
        `Your order for $${message.totalAmount} has been confirmed!`
      );
    } else if (routingKey === 'order.cancelled') {
      await sendEmail(
        message.userId,
        `Order Cancelled: #${message.orderId}`,
        `We're sorry, your order was cancelled. Reason: ${message.reason}`
      );
    }

    channel.ack(msg);

  } catch (error) {
    console.error('Error sending notification:', error, message);
    channel.nack(msg, false, false); 
  }
}

function startNotificationSubscriber() {
  // Listen for 'order.confirmed'
  consumeMessages(NOTIFICATION_QUEUE, 'order.confirmed', handleNotification);
  
  // Listen for 'order.cancelled'
  consumeMessages(NOTIFICATION_QUEUE, 'order.cancelled', handleNotification);
}

module.exports = { startNotificationSubscriber };
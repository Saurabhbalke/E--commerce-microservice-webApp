const amqplib = require('amqplib');

const RABBIT_URI = process.env.RABBIT_URI || 'amqp://guest:guest@localhost:5672';
const ORDER_EVENTS_EXCHANGE = 'order_events'; // Main exchange for saga
const NOTIFICATION_QUEUE = 'notification_queue';

let channel, connection;

/**
 * Connects to RabbitMQ and asserts the main topic exchange.
 * Services will be responsible for asserting their own queues and bindings.
 */
async function connectToRabbitMQ() {
  try {
    connection = await amqplib.connect(RABBIT_URI);
    channel = await connection.createChannel();

    // Assert the main exchange (type: 'topic' is flexible and powerful)
    await channel.assertExchange(ORDER_EVENTS_EXCHANGE, 'topic', { durable: true });

    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error.message);
    // Implement retry logic in a real app
    process.exit(1); // Exit if connection fails on startup
  }
}

/**
 * Publishes a message to the main exchange with a routing key.
 * @param {string} routingKey - e.g., 'order.created', 'stock.reserved'
 * @param {object} message - The JSON object payload
 */
function publishMessage(routingKey, message) {
  if (!channel) {
    console.error('Cannot publish message: RabbitMQ channel is not available.');
    return;
  }
  const payload = Buffer.from(JSON.stringify(message));

  channel.publish(ORDER_EVENTS_EXCHANGE, routingKey, payload, {
    persistent: true // Ensure message survives broker restart
  });
  console.log(`[x] Sent ${routingKey}:`, JSON.stringify(message));
}

/**
 * Creates a queue, binds it to the exchange, and starts consuming messages.
 * @param {string} queueName - The name of the queue.
 * @param {string} bindingKey - The routing key to bind (e.t., 'order.created')
 * @param {function} onMessage - The callback function to process the message.
 */
async function consumeMessages(queueName, bindingKey, onMessage) {
  if (!channel) {
    console.error('Cannot consume messages: RabbitMQ channel is not available.');
    return;
  }
  
  // Assert a durable queue
  await channel.assertQueue(queueName, { durable: true });
  
  // Bind queue to the exchange with the binding key 
  await channel.bindQueue(queueName, ORDER_EVENTS_EXCHANGE, bindingKey);
  
  console.log(`Waiting for messages on queue [${queueName}] with key [${bindingKey}]`);

  channel.consume(queueName, (msg) => {
    if (msg !== null) {
      onMessage(msg);
    }
  }, { noAck: false }); // We will manually acknowledge messages
}

function getChannel() {
  return channel;
}

module.exports = {
  connectToRabbitMQ,
  publishMessage,
  consumeMessages,
  getChannel,
  ORDER_EVENTS_EXCHANGE,
  NOTIFICATION_QUEUE
};
const { connectToRabbitMQ } = require('../../shared/utils/rabbitMQ');
const { startNotificationSubscriber } = require('./notificationSubscriber');

async function startService() {
  console.log('Starting Notification Service...');
  
  // Connect to RabbitMQ
  await connectToRabbitMQ();

  // Start RabbitMQ subscriber to listen for final order events
  startNotificationSubscriber();

  console.log('Notification Service is running and waiting for messages.');
}

startService().catch(err => {
  console.error('Failed to start Notification Service:', err);
  process.exit(1);
});
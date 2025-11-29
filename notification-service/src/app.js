const fs = require('fs');
const path = require('path');

// Smart path for shared module (Docker vs local dev)
const localSharedPath = path.join(__dirname, '../shared/utils/rabbitMQ');
const parentSharedPath = path.join(__dirname, '../../shared/utils/rabbitMQ');
const sharedPath = fs.existsSync(localSharedPath + '.js') ? localSharedPath : parentSharedPath;
const { connectToRabbitMQ } = require(sharedPath);
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
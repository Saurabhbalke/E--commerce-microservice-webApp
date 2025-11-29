const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Smart path for shared module (Docker vs local dev)
const localSharedPath = path.join(__dirname, '../shared/utils/rabbitMQ');
const parentSharedPath = path.join(__dirname, '../../shared/utils/rabbitMQ');
const sharedPath = fs.existsSync(localSharedPath + '.js') ? localSharedPath : parentSharedPath;
const { connectToRabbitMQ } = require(sharedPath);
const { startOrderSubscriber } = require('./orderSubscriber');
const orderRoutes = require('./routes/orderRoutes');

// --- Environment & Config ---
const PORT = process.env.PORT || 3004;
const MONGO_URI = process.env.MONGO_URI;

// --- Express App Setup ---
const app = express();
app.use(express.json());
 
// Routes
app.use('/', orderRoutes);

// --- Database Connection & Server Start ---
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Order Service connected to MongoDB');
    
    // Connect to RabbitMQ
    await connectToRabbitMQ();

    // Start RabbitMQ subscriber to listen for replies
    startOrderSubscriber();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Order REST API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB or RabbitMQ connection error:', err);
    process.exit(1);
  });
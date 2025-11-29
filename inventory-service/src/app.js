const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Smart path for shared module (Docker vs local dev)
const localSharedPath = path.join(__dirname, '../shared/utils/rabbitMQ');
const parentSharedPath = path.join(__dirname, '../../shared/utils/rabbitMQ');
const sharedPath = fs.existsSync(localSharedPath + '.js') ? localSharedPath : parentSharedPath;
const { connectToRabbitMQ } = require(sharedPath);
const { startInventorySubscriber } = require('./inventorySubscriber');
const inventoryRoutes = require('./routes/inventoryRoutes');

// --- Environment & Config ---
const PORT = process.env.PORT || 3006;
const MONGO_URI = process.env.MONGO_URI;

// --- Express App Setup ---
const app = express();
app.use(express.json());

// Routes (for admin to add stock)
app.use('/', inventoryRoutes);

// --- Database Connection & Server Start ---
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Inventory Service connected to MongoDB');
    
    // Connect to RabbitMQ
    await connectToRabbitMQ();

    // Start RabbitMQ subscriber to listen for orders
    startInventorySubscriber();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Inventory REST API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB or RabbitMQ connection error:', err);
    process.exit(1);
  });
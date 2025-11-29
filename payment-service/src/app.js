const express = require('express');
const mongoose = require('mongoose');
const { connectToRabbitMQ } = require('../../shared/utils/rabbitMQ');
const { startPaymentSubscriber } = require('./paymentSubscriber');
const paymentRoutes = require('./routes/paymentRoutes');

// --- Environment & Config ---
const PORT = process.env.PORT || 3005;
const MONGO_URI = process.env.MONGO_URI;

// --- Express App Setup ---
const app = express();
app.use(express.json());

// Routes
app.use('/', paymentRoutes);

// --- Database Connection & Server Start ---
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Payment Service connected to MongoDB');
    
    // Connect to RabbitMQ
    await connectToRabbitMQ();

    // Start RabbitMQ subscriber to listen for orders
    startPaymentSubscriber();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Payment REST API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB or RabbitMQ connection error:', err);
    process.exit(1);
  });
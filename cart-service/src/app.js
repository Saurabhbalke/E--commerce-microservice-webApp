const express = require('express');
const mongoose = require('mongoose');

// Internal requires
const cartRoutes = require('./routes/cartRoutes');

// --- Environment & Config ---
const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI;

// --- Express App Setup ---
const app = express();
app.use(express.json());

// Routes
app.use('/', cartRoutes);

// --- Database Connection & Server Start ---
mongoose.connect(MONGO_URI, { family: 4 })
  .then(() => {
    console.log('Cart Service connected to MongoDB');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Cart REST API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(MONGO_URI)
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
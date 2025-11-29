const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  getAllOrders
} = require('../controllers/orderController');

// Routes based on your original file
router.post('/', placeOrder);
router.get('/user/:userId', getUserOrders); // More specific route
router.get('/', getAllOrders);

// Health check
router.get('/health', (req, res) => res.send('Order service OK'));

module.exports = router;
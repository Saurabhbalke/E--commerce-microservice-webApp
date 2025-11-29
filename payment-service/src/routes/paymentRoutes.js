const express = require('express');
const router = express.Router();
const { getPaymentStatus } = require('../controllers/paymentController');

// Routes based on your original file
// We don't have a /pay route anymore, as payment is triggered by the Saga.
// A /pay route would be for *initiating* 3rd party checkout (e.g., Razorpay)
router.get('/:orderId', getPaymentStatus);

// Health check
router.get('/health', (req, res) => res.send('Payment service OK'));

module.exports = router;
const Payment = require('../models/Payment');

// @desc    Get payment status for an order
// @route   GET /:orderId
const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (payment) {
      res.json(payment);
    } else {
      res.status(404).json({ message: 'Payment for order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPaymentStatus,
};
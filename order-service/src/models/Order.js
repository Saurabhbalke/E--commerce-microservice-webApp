const mongoose = require('mongoose');

// This is the sub-document for items *within* an order
const itemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Good to reference the other service's model (even if not enforced)
    required: true
  },
  // --- REMOVED 'name' ---
  // The order service can get this from the product service
  // later if it ever needs to build a detailed report.
  price: {
    type: Number,
    required: true
    // This is the price *at the time of purchase*
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  items: [itemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED', 'DELIVERED'],
    default: 'PENDING'
  },
  // --- Fields for Saga State ---
  stockStatus: {
    type: String,
    enum: ['PENDING', 'RESERVED', 'FAILED'],
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'FAILED'],
    default: 'PENDING'
  },
  failureReason: {
    type: String
  }
  // ------------------------------
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
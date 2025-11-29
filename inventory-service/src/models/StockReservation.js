const mongoose = require('mongoose');

/**
 * Tracks stock reservations for idempotency.
 * Prevents duplicate processing of the same order.
 */
const stockReservationSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true // Ensure each order is processed only once
  },
  status: {
    type: String,
    enum: ['RESERVED', 'FAILED', 'RELEASED'],
    required: true
  },
  items: [{
    productId: String,
    quantity: Number
  }],
  failureReason: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StockReservation', stockReservationSchema);

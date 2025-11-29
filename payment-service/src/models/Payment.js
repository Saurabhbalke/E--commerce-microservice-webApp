const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true,
    unique: true
  },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'FAILED'],
    default: 'PENDING',
  },
  transactionId: { type: String }, // From 3rd party
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
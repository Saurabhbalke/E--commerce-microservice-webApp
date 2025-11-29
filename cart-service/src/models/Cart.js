const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // This is just for reference, not a hard FK
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // Price at the time of adding
  name: { type: String }, // Product name at the time of adding
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference
    required: true,
    unique: true,
  },
  items: [itemSchema],
  updatedAt: { type: Date, default: Date.now },
});

// Update the 'updatedAt' timestamp on save
cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
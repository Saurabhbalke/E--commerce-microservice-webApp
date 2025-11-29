const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: { 
    type: String, 
    required: true, 
    unique: true // Product ID from product-service
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
});

module.exports = mongoose.model('Inventory', inventorySchema);
const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  updateItem,
  removeItem
} = require('../controllers/cartController');

// Routes based on your original file
router.get('/:userId', getCart);
router.post('/', addItem);
router.put('/', updateItem);
router.delete('/', removeItem); // This should be more specific, e.g., /:userId/:itemId

// Health check
router.get('/health', (req, res) => res.send('Cart service OK'));

module.exports = router;
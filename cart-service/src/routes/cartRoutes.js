const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  updateItem,
  removeItem
} = require('../controllers/cartController');

// Health check (must be before /:userId to avoid matching)
router.get('/health', (req, res) => res.send('Cart service OK'));

// Routes based on your original file
router.get('/:userId', getCart);
router.post('/', addItem);
router.put('/', updateItem);
router.delete('/', removeItem);

module.exports = router;
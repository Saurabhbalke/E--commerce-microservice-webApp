const express = require('express');
const router = express.Router();
const {
  addOrUpdateStock,
  getProductStock,
  getAllInventory
} = require('../controllers/inventoryController');

// Routes based on your original file
router.post('/', addOrUpdateStock);
router.get('/:productId', getProductStock);
router.get('/', getAllInventory);

// Health check
router.get('/health', (req, res) => res.send('Inventory service OK'));

module.exports = router;
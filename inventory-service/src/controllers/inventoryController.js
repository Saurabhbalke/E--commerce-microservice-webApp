const Inventory = require('../models/Inventory');

// @desc    Add or update stock (Admin)
// @route   POST /
const addOrUpdateStock = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity == null) {
    return res.status(400).json({ message: 'ProductId and quantity required' });
  }

  try {
    const stockItem = await Inventory.findOneAndUpdate(
      { productId },
      { $set: { productId, quantity } },
      { upsert: true, new: true } // Upsert = create if not exist
    );
    res.status(201).json(stockItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock for one product
// @route   GET /:productId
const getProductStock = async (req, res) => {
  try {
    const item = await Inventory.findOne({ productId: req.params.productId });
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Stock for product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory (Admin)
// @route   GET /
const getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrUpdateStock,
  getProductStock,
  getAllInventory,
};
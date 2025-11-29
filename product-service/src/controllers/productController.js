const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /
const createProduct = async (req, res) => {
  const { name, description, price, category } = req.body;
  try {
    const product = new Product({
      name,
      description,
      price,
      category,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /:id
const updateProduct = async (req, res) => {
  // ... implementation
  res.send('Update product');
};

// @desc    Delete a product
// @route   DELETE /:id
const deleteProduct = async (req, res) => {
  // ... implementation
  res.send('Delete product');
};


module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
const Cart = require('../models/Cart');
const { userClient, productClient } = require('../grpcClients');
const mongoose = require('mongoose');

// Helper function to call gRPC with Promise
function getProductById(productId) {
  return new Promise((resolve, reject) => {
    productClient.GetProductById({ productId }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// Helper function to call gRPC with Promise (if needed later)
function getUserById(userId) {
  return new Promise((resolve, reject) => {
    userClient.GetUserById({ userId }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// @desc    Add item to cart or increase quantity
// @route   POST /
const addItem = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // 1. Validate Product via gRPC
    const productData = await getProductById(productId);
    if (!productData || !productData.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. We trust the userId for now (or validate via gRPC if strict)
    const userData = await getUserById(userId);
    if (!userData || !userData.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Find user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // 4. Check if item already in cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity,
        price: productData.price, // Store price from product service
        name: productData.name,
      });
    }

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);

  } catch (error) {
    console.error('gRPC or DB Error in addItem:', error);
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

// @desc    Get user's cart
// @route   GET /:userId
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity directly (Optional)
// @route   PUT /
const updateItem = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

    if (itemIndex > -1) {
      // If quantity is > 0, update it
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        // If quantity is 0 or less, remove the item
        cart.items.splice(itemIndex, 1);
      }
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /
const removeItem = async (req, res) => {
  const { userId, productId } = req.body; // Expecting JSON body for DELETE

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Filter out the item to remove it
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Optional: check if anything was actually removed
    if (cart.items.length === initialLength) {
       return res.status(404).json({ message: 'Item not found in cart' });
    }

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);

  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ message: 'Error removing item', error: error.message });
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
};
const Order = require('../models/Order');
const { publishMessage } = require('../../../shared/utils/rabbitMQ');
// In a real app, you'd call the Cart service to get cart contents
// For now, we assume items are passed in the request body

// @desc    Place a new order (Saga Starter)
// @route   POST /
const placeOrder = async (req, res) => {
  const { userId, items, totalAmount } = req.body;

  if (!userId || !items || !items.length || !totalAmount) {
    return res.status(400).json({ message: 'Missing order details' });
  }

  try {
    // 1. Create the order in 'PENDING' state
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      status: 'PENDING',
      stockStatus: 'PENDING',
      paymentStatus: 'PENDING',
    });
    await newOrder.save();

    // 2. Publish the ORDER_CREATED event
    const eventMessage = {
      orderId: newOrder._id.toString(),
      userId: newOrder.userId,
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
    };
    
    // Use the routing key 'order.created'
    publishMessage('order.created', eventMessage);

    // 3. Respond to the user immediately
    // 202 "Accepted" is the correct status code for an async operation
    res.status(202).json({ 
      message: 'Order received and is processing.',
      order: newOrder 
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
};

// @desc    Get orders for a specific user
// @route   GET /user/:userId
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getAllOrders,
};
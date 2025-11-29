const fs = require('fs');
const path = require('path');
const localSharedPath = path.join(__dirname, '../shared/utils/rabbitMQ');
const parentSharedPath = path.join(__dirname, '../../shared/utils/rabbitMQ');
const sharedPath = fs.existsSync(localSharedPath + '.js') ? localSharedPath : parentSharedPath;
const { consumeMessages, publishMessage, getChannel } = require(sharedPath);
const Inventory = require('./models/Inventory');
const StockReservation = require('./models/StockReservation');

const ORDER_CREATED_QUEUE = 'inventory_order_created_queue';
const STOCK_RELEASE_QUEUE = 'inventory_stock_release_queue';

/**
 * Handles the 'order.created' event.
 * Tries to reserve stock atomically to prevent race conditions.
 */
async function handleOrderCreated(msg) {
  const channel = getChannel();
  let message;
  try {
    message = JSON.parse(msg.content.toString());
    const { orderId, items } = message;
    console.log(`[i] Received order.created event for Order ID: ${orderId}`);

    // Idempotency check: has this order already been processed?
    const existingReservation = await StockReservation.findOne({ orderId });
    if (existingReservation) {
      console.log(`[i] Order ${orderId} already processed with status: ${existingReservation.status}. Skipping.`);
      
      // Re-publish the result for safety
      if (existingReservation.status === 'RESERVED') {
        publishMessage('stock.reserved', { orderId, status: 'SUCCESS' });
      } else if (existingReservation.status === 'FAILED') {
        publishMessage('stock.reservation_failed', { orderId, status: 'FAILED', reason: existingReservation.failureReason });
      }
      
      channel.ack(msg);
      return;
    }

    // Track reserved items for rollback if needed
    const reservedItems = [];
    let failureReason = '';
    
    // Atomic check-and-reserve for each item
    for (const item of items) {
      // Atomic operation: check availability AND reserve in single query
      const result = await Inventory.findOneAndUpdate(
        { 
          productId: item.productId,
          quantity: { $gte: item.quantity } // Only update if enough stock
        },
        { 
          $inc: { quantity: -item.quantity } // Decrement stock
        },
        { new: true } // Return updated document
      );
      
      if (!result) {
        // Stock not available or insufficient
        failureReason = `Insufficient stock for product ${item.productId}`;
        
        // Rollback: restore previously reserved items
        for (const reserved of reservedItems) {
          await Inventory.updateOne(
            { productId: reserved.productId },
            { $inc: { quantity: reserved.quantity } }
          );
        }
        
        // Record failed reservation for idempotency
        await StockReservation.create({
          orderId,
          status: 'FAILED',
          items,
          failureReason
        });
        
        // Publish failure reply
        publishMessage('stock.reservation_failed', { orderId, status: 'FAILED', reason: failureReason });
        console.log(`[i] Stock reservation FAILED for Order ID: ${orderId}. Reason: ${failureReason}`);
        channel.ack(msg);
        return;
      }
      
      // Track successful reservation
      reservedItems.push({ productId: item.productId, quantity: item.quantity });
    }
    
    // All items reserved successfully
    // Record successful reservation for idempotency
    await StockReservation.create({
      orderId,
      status: 'RESERVED',
      items: reservedItems
    });
    
    publishMessage('stock.reserved', { orderId, status: 'SUCCESS' });
    console.log(`[i] Stock reserved for Order ID: ${orderId}`);
    channel.ack(msg);

  } catch (error) {
    console.error('Error reserving stock:', error, message);
    channel.nack(msg, false, false);
  }
}

/**
 * Handles compensation event 'stock.release'.
 * This is called if payment fails *after* stock was reserved.
 */
async function handleStockRelease(msg) {
  const channel = getChannel();
  let message;
  try {
    message = JSON.parse(msg.content.toString());
    const { orderId, items } = message;
    console.log(`[i] Received stock.release (compensation) for Order ID: ${orderId}`);

    // Check if already released
    const reservation = await StockReservation.findOne({ orderId });
    if (reservation && reservation.status === 'RELEASED') {
      console.log(`[i] Stock for Order ${orderId} already released. Skipping.`);
      channel.ack(msg);
      return;
    }

    // Atomically increment the stock back
    for (const item of items) {
      await Inventory.updateOne(
        { productId: item.productId },
        { $inc: { quantity: item.quantity } }
      );
    }
    
    // Update reservation status
    if (reservation) {
      await StockReservation.updateOne(
        { orderId },
        { $set: { status: 'RELEASED' } }
      );
    }
    
    console.log(`[i] Stock released for Order ID: ${orderId}`);
    channel.ack(msg);

  } catch (error) {
    console.error('Error releasing stock:', error, message);
    channel.nack(msg, false, false);
  }
}
 
function startInventorySubscriber() {
  // Listen for new orders
  consumeMessages(ORDER_CREATED_QUEUE, 'order.created', handleOrderCreated);
  
  // Listen for compensation (stock release) events
  consumeMessages(STOCK_RELEASE_QUEUE, 'stock.release', handleStockRelease);
}

module.exports = { startInventorySubscriber };
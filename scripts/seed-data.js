#!/usr/bin/env node
/**
 * Seed Script for E-Commerce Application
 * Inserts dummy data into MongoDB databases
 * 
 * Usage:
 *   node scripts/seed-data.js
 * 
 * For Kubernetes:
 *   kubectl port-forward -n ecommerce svc/mongodb 27017:27017
 *   MONGO_HOST=localhost node scripts/seed-data.js
 */

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';

const DATABASES = {
  user: `mongodb://${MONGO_HOST}:${MONGO_PORT}/user_db`,
  product: `mongodb://${MONGO_HOST}:${MONGO_PORT}/product_db`,
  inventory: `mongodb://${MONGO_HOST}:${MONGO_PORT}/inventory_db`,
  cart: `mongodb://${MONGO_HOST}:${MONGO_PORT}/cart_db`,
  order: `mongodb://${MONGO_HOST}:${MONGO_PORT}/order_db`,
  payment: `mongodb://${MONGO_HOST}:${MONGO_PORT}/payment_db`,
};

// ============== DUMMY DATA ==============

const users = [
  {
    _id: new ObjectId(),
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123', // Will be hashed
    role: 'customer',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date(),
  },
];

const products = [
  {
    _id: new ObjectId(),
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life',
    price: 149.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking, heart rate monitor, and GPS',
    price: 299.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Laptop Stand Aluminum',
    description: 'Ergonomic adjustable laptop stand for better posture',
    price: 49.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Mechanical Keyboard RGB',
    description: 'Cherry MX switches with customizable RGB backlighting',
    price: 129.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 39.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'USB-C Hub 7-in-1',
    description: 'Multi-port adapter with HDMI, USB 3.0, SD card reader',
    price: 59.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Portable Charger 20000mAh',
    description: 'High-capacity power bank with fast charging support',
    price: 44.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Noise Canceling Earbuds',
    description: 'True wireless earbuds with active noise cancellation',
    price: 179.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Webcam HD 1080p',
    description: 'Full HD webcam with built-in microphone for video calls',
    price: 79.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Desk Lamp LED',
    description: 'Adjustable LED desk lamp with multiple brightness levels',
    price: 34.99,
    category: 'Home Office',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    createdAt: new Date(),
  },
];

// ============== SEED FUNCTIONS ==============

async function seedUsers() {
  const client = new MongoClient(DATABASES.user);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('users');

    // Clear existing data
    await collection.deleteMany({});

    // Hash passwords and insert
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    await collection.insertMany(usersWithHashedPasswords);
    console.log(`✅ Inserted ${users.length} users`);
    
    // Print login credentials
    console.log('\n📝 Test Accounts:');
    users.forEach(u => {
      console.log(`   Email: ${u.email} | Password: ${u.password} | Role: ${u.role}`);
    });

    return users;
  } finally {
    await client.close();
  }
}

async function seedProducts() {
  const client = new MongoClient(DATABASES.product);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('products');

    // Clear existing data
    await collection.deleteMany({});

    await collection.insertMany(products);
    console.log(`✅ Inserted ${products.length} products`);
    
    return products;
  } finally {
    await client.close();
  }
}

async function seedInventory(productList) {
  const client = new MongoClient(DATABASES.inventory);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('inventories');

    // Clear existing data
    await collection.deleteMany({});

    // Create inventory for each product
    const inventoryItems = productList.map((product, index) => ({
      _id: new ObjectId(),
      productId: product._id.toString(),
      productName: product.name,
      quantity: 50 + (index * 10), // 50-140 units
      reservedQuantity: 0,
      updatedAt: new Date(),
    }));

    await collection.insertMany(inventoryItems);
    console.log(`✅ Inserted ${inventoryItems.length} inventory records`);
    
    return inventoryItems;
  } finally {
    await client.close();
  }
}

async function clearOtherDatabases() {
  // Clear carts
  let client = new MongoClient(DATABASES.cart);
  try {
    await client.connect();
    await client.db().collection('carts').deleteMany({});
    console.log('✅ Cleared carts');
  } finally {
    await client.close();
  }

  // Clear orders
  client = new MongoClient(DATABASES.order);
  try {
    await client.connect();
    await client.db().collection('orders').deleteMany({});
    console.log('✅ Cleared orders');
  } finally {
    await client.close();
  }

  // Clear payments
  client = new MongoClient(DATABASES.payment);
  try {
    await client.connect();
    await client.db().collection('payments').deleteMany({});
    console.log('✅ Cleared payments');
  } finally {
    await client.close();
  }
}

// ============== MAIN ==============

async function main() {
  console.log('🌱 Starting database seed...\n');
  console.log(`📍 MongoDB Host: ${MONGO_HOST}:${MONGO_PORT}\n`);

  try {
    // Seed data
    await seedUsers();
    console.log('');
    
    const productList = await seedProducts();
    console.log('');
    
    await seedInventory(productList);
    console.log('');
    
    await clearOtherDatabases();
    
    console.log('\n✨ Seed completed successfully!\n');
    
    console.log('🔑 Quick Login:');
    console.log('   Customer: john@example.com / password123');
    console.log('   Admin: admin@example.com / admin123\n');
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

main();

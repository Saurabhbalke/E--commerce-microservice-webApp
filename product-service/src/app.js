const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Internal requires
const productRoutes = require('./routes/productRoutes');
const Product = require('./models/Product'); // Used by gRPC

// --- Environment & Config ---
const PORT = process.env.PORT || 3002;
const GRPC_PORT = process.env.GRPC_PORT || 50052;
const MONGO_URI = process.env.MONGO_URI;
const PROTO_PATH = path.join(__dirname, '../../protos/product.proto');

// --- gRPC Server Setup ---
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(packageDefinition).product;

function startGrpcServer() {
  const server = new grpc.Server();
  server.addService(productProto.ProductService.service, {
    // Implement the gRPC GetProductById function
    GetProductById: async (call, callback) => {
      try {
        const product = await Product.findById(call.request.productId);
        if (product) {
          callback(null, {
            productId: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            exists: true,
          });
        } else {
          callback(null, { exists: false });
        }
      } catch (error) {
        callback({
          code: grpc.status.INTERNAL,
          message: error.message,
        });
      }
    },
  });

  server.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind gRPC server:', err);
      return;
    }
    console.log(`Product gRPC server running on port ${port}`);
    server.start();
  });
}

// --- Express App Setup ---
const app = express();
app.use(express.json());

// Routes
app.use('/', productRoutes);

// --- Database Connection & Server Start ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Product Service connected to MongoDB');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Product REST API running on port ${PORT}`);
    });

    // Start gRPC server
    startGrpcServer();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
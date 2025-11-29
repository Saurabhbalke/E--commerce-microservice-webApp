const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Internal requires
const userRoutes = require('./routes/userRoutes');
const { grpcGetUserById } = require('./controllers/userController');
const User = require('./models/User'); // Used by gRPC

// --- Environment & Config ---
const PORT = process.env.PORT || 3001;
const GRPC_PORT = process.env.GRPC_PORT || 50051;
const MONGO_URI = process.env.MONGO_URI;
// Check for local protos (Docker) first, then relative path (local dev)
const fs = require('fs');
const localProtoPath = path.join(__dirname, '../protos/user.proto');
const parentProtoPath = path.join(__dirname, '../../protos/user.proto');
const PROTO_PATH = fs.existsSync(localProtoPath) ? localProtoPath : parentProtoPath;

// --- gRPC Server Setup ---
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

function startGrpcServer() {
  const server = new grpc.Server();
  server.addService(userProto.UserService.service, {
    // Implement the gRPC GetUserById function
    GetUserById: async (call, callback) => {
      try {
        const user = await User.findById(call.request.userId);
        if (user) {
          callback(null, {
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
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
    console.log(`User gRPC server running on port ${port}`);
    server.start();
  });
}

// --- Express App Setup ---
const app = express();
app.use(express.json());

// Routes
app.use('/', userRoutes); // Use the routes defined in userRoutes.js

// --- Database Connection & Server Start ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('User Service connected to MongoDB');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`User REST API running on port ${PORT}`);
    });

    // Start gRPC server
    startGrpcServer();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
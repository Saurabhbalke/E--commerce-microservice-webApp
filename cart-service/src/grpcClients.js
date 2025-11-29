const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// --- Config ---
const USER_PROTO_PATH = path.join(__dirname, '../../protos/user.proto');
const PRODUCT_PROTO_PATH = path.join(__dirname, '../../protos/product.proto');
const USER_SERVICE_URL = process.env.USER_SERVICE_GRPC_URL;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_GRPC_URL;

// --- Load Protos ---
const userPackageDef = protoLoader.loadSync(USER_PROTO_PATH, {});
const userProto = grpc.loadPackageDefinition(userPackageDef).user;

const productPackageDef = protoLoader.loadSync(PRODUCT_PROTO_PATH, {});
const productProto = grpc.loadPackageDefinition(productPackageDef).product;

// --- Create Clients ---
const userClient = new userProto.UserService(
  USER_SERVICE_URL,
  grpc.credentials.createInsecure()
);

const productClient = new productProto.ProductService(
  PRODUCT_SERVICE_URL,
  grpc.credentials.createInsecure()
);

console.log(`gRPC User client connecting to: ${USER_SERVICE_URL}`);
console.log(`gRPC Product client connecting to: ${PRODUCT_SERVICE_URL}`);

module.exports = { userClient, productClient };
const express = require('express');
const proxy = require('express-http-proxy');
const morgan = require('morgan');
const cors = require('cors');

// Load environment variables
const PORT = process.env.PORT || 3008;

const app = express();

// CORS configuration for frontend
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev')); // Logger

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('API Gateway is running.');
});

// Proxy routes
// This simple proxy forwards requests based on the path.
// An advanced setup would use this layer for auth, rate limiting, etc.
app.use('/user', proxy(process.env.USER_SERVICE_URL));
app.use('/product', proxy(process.env.PRODUCT_SERVICE_URL));
app.use('/cart', proxy(process.env.CART_SERVICE_URL));
app.use('/order', proxy(process.env.ORDER_SERVICE_URL));
app.use('/payment', proxy(process.env.PAYMENT_SERVICE_URL));
app.use('/inventory', proxy(process.env.INVENTORY_SERVICE_URL));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Forwarding /user to', process.env.USER_SERVICE_URL);
  console.log('Forwarding /product to', process.env.PRODUCT_SERVICE_URL);
  console.log('Forwarding /cart to', process.env.CART_SERVICE_URL);
  console.log('Forwarding /order to', process.env.ORDER_SERVICE_URL);
  // ... etc
});
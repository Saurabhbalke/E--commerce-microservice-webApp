# Quick Start - Frontend

## Start the Frontend Application

```bash
cd /home/saurabh/Desktop/ecom-monorepo/frontend-service
npm start
```

The application will be available at: **http://localhost:4200**

## Before Starting Frontend

Ensure these backend services are running:
1. MongoDB (default: localhost:27017)
2. RabbitMQ (default: localhost:5672)
3. API Gateway (port 3008)
4. User Service (port 3001)
5. Product Service (port 3002)
6. Cart Service (port 3003)
7. Order Service (port 3004)
8. Payment Service (port 3005)
9. Inventory Service (port 3006)

## Test Data Setup

### 1. Create a Product
```bash
curl -X POST http://localhost:3008/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop with RTX graphics",
    "price": 1299.99,
    "category": "Electronics"
  }'
```

### 2. Add Inventory (use product ID from step 1)
```bash
curl -X POST http://localhost:3008/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOUR_PRODUCT_ID_HERE",
    "quantity": 50
  }'
```

### 3. Create More Products
```bash
curl -X POST http://localhost:3008/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with long battery life",
    "price": 29.99,
    "category": "Accessories"
  }'

curl -X POST http://localhost:3008/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mechanical Keyboard",
    "description": "RGB mechanical keyboard with blue switches",
    "price": 89.99,
    "category": "Accessories"
  }'
```

## Using the Application

1. **Register**: Create a new account at http://localhost:4200/register
2. **Login**: Login with your credentials
3. **Browse**: View products on the home page
4. **Add to Cart**: Click "Add to Cart" on any product
5. **Checkout**: Review cart and place order
6. **Orders**: View your order history

## Key URLs

- Home/Products: http://localhost:4200/products
- Login: http://localhost:4200/login
- Register: http://localhost:4200/register
- Cart: http://localhost:4200/cart
- Orders: http://localhost:4200/orders

Enjoy your E-Commerce application! 🚀

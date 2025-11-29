# E-Commerce Frontend Setup & Running Guide

## Quick Start

### 1. Start Backend Services

Make sure all backend services are running:

```bash
# From the root directory

# Start MongoDB and RabbitMQ (if using Docker)
docker-compose up -d

# Start each service (in separate terminals or use a process manager)

# API Gateway
cd api-gateway && npm start

# User Service
cd user-service && npm start

# Product Service
cd product-service && npm start

# Cart Service
cd cart-service && npm start

# Order Service
cd order-service && npm start

# Payment Service
cd payment-service && npm start

# Inventory Service
cd inventory-service && npm start
```

### 2. Start Frontend Application

```bash
cd frontend-service

# Install dependencies (first time only)
npm install

# Start the Angular development server
npm start
# or
ng serve
```

The frontend will be available at: `http://localhost:4200`

## Application Flow

### 1. **Register a New User**
- Navigate to `/register`
- Fill in: Name, Email, Password
- After registration, you'll be automatically logged in

### 2. **Browse Products**
- Default page shows product catalog
- View product details by clicking on any product

### 3. **Add to Cart**
- Click "Add to Cart" on any product (requires login)
- Adjust quantities in cart

### 4. **Checkout & Place Order**
- Review cart
- Click "Proceed to Checkout"
- Place order
- Order goes through Saga pattern:
  - Inventory reservation
  - Payment processing (10% failure rate for demo)
  - Order confirmation

### 5. **View Orders**
- Navigate to "My Orders"
- See order status, payment status, and stock status

## Backend Configuration

### API Gateway (Port 3008)
Routes:
- `http://localhost:3008/user` → User Service
- `http://localhost:3008/product` → Product Service
- `http://localhost:3008/cart` → Cart Service
- `http://localhost:3008/order` → Order Service

### Services Ports
- API Gateway: 3008
- User Service: 3001
- Product Service: 3002
- Cart Service: 3003
- Order Service: 3004
- Payment Service: 3005
- Inventory Service: 3006

## Testing the Application

### 1. Create Products
```bash
# Using curl or Postman
curl -X POST http://localhost:3008/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics"
  }'
```

### 2. Create Inventory
```bash
curl -X POST http://localhost:3008/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<PRODUCT_ID>",
    "quantity": 100
  }'
```

### 3. Use the Frontend
- Register a user
- Browse products
- Add to cart
- Place order

## Features Implemented

### Frontend Components
✅ Login & Registration
✅ Product List & Details
✅ Shopping Cart
✅ Checkout Process
✅ Order History
✅ Responsive Navigation

### Backend Integration
✅ JWT Authentication
✅ Product Catalog Management
✅ Cart Operations (Add/Update/Remove)
✅ Order Placement with Saga Pattern
✅ Order Status Tracking

### UI/UX
✅ Bootstrap 5 responsive design
✅ Loading states
✅ Error handling
✅ Form validation
✅ Cart badge counter
✅ Default product images

## Saga Pattern Flow

When an order is placed:

1. **Order Created** - Status: PENDING
2. **Inventory Check** - Saga Step 1
   - Success: Stock reserved
   - Failure: Order cancelled
3. **Payment Processing** - Saga Step 2
   - Success: Payment processed
   - Failure: Stock released, order cancelled
4. **Order Confirmed** - All steps successful

## Troubleshooting

### Frontend won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS errors
- Ensure API Gateway has CORS enabled (already configured)
- Check frontend is running on port 4200

### Authentication issues
- Clear browser localStorage
- Check User Service is running
- Verify JWT token generation

### Cart not loading
- Ensure Cart Service is running
- Check user is logged in
- Verify userId in localStorage

## Development Notes

### Adding New Features
- **Components**: `frontend-service/src/app/components/`
- **Services**: `frontend-service/src/app/services/`
- **Models**: `frontend-service/src/app/models/`
- **Routes**: `frontend-service/src/app/app.routes.ts`

### Code Structure
- All components are standalone (Angular 17+)
- Template-driven forms with validation
- RxJS for async operations
- Service-based architecture for API calls

### Image Management
- Current: Default SVG placeholder for all products
- To customize: Replace `src/assets/images/default.svg`
- For real images: Modify product model to include imageUrl field

## Environment Configuration

### Frontend (Angular)
- Development: `http://localhost:4200`
- API Gateway URL: `http://localhost:3008`

### Backend Services
All services use environment variables from `.env` files in each service directory.

## Production Deployment

### Frontend
```bash
cd frontend-service
ng build --configuration production
# Deploy dist/frontend-service to web server
```

### Backend
Ensure all environment variables are properly set in production environment.

## Additional Resources

- Angular Documentation: https://angular.io
- Bootstrap Documentation: https://getbootstrap.com
- RxJS Documentation: https://rxjs.dev

## Support & Issues

For issues or questions:
1. Check service logs
2. Verify all services are running
3. Check browser console for errors
4. Verify API Gateway connectivity

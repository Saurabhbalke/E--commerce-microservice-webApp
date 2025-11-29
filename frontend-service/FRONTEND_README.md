# E-Commerce Frontend Service

Angular-based frontend application for the e-commerce microservices platform.

## Features

- **User Authentication**: Register and login functionality
- **Product Catalog**: Browse and view product details
- **Shopping Cart**: Add, update, and remove items from cart
- **Order Management**: Place orders and view order history
- **Responsive Design**: Bootstrap-based responsive UI

## Project Structure

```
src/
├── app/
│   ├── components/          # UI Components
│   │   ├── header/          # Navigation header
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── product-list/    # Product listing
│   │   ├── product-detail/  # Product details
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout page
│   │   └── orders/          # Order history
│   ├── models/              # TypeScript interfaces
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── cart.model.ts
│   │   └── order.model.ts
│   ├── services/            # API Services
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── app.component.ts
│   ├── app.routes.ts        # Route configuration
│   └── app.config.ts        # App configuration
└── assets/
    └── images/
        └── default.svg      # Default product image
```

## Prerequisites

- Node.js (v16 or higher)
- Angular CLI (v17.2.1)
- Running backend services (API Gateway on port 3008)

## Installation

```bash
# Install dependencies
npm install
```

## Development Server

```bash
# Start the development server
npm start

# Or
ng serve
```

Navigate to `http://localhost:4200/` in your browser.

## Building for Production

```bash
# Build the project
npm run build

# Build output will be in the dist/ directory
```

## API Configuration

The frontend connects to the API Gateway at `http://localhost:3008`. 

API endpoints used:
- `/user` - User service (authentication)
- `/product` - Product service (catalog)
- `/cart` - Cart service (shopping cart)
- `/order` - Order service (orders)

## Features Details

### Authentication
- JWT token-based authentication
- Token stored in localStorage
- Auto-login on page refresh

### Product Management
- View all products
- View product details
- Add products to cart

### Shopping Cart
- Add items to cart
- Update item quantities
- Remove items from cart
- Real-time cart total calculation

### Order Processing
- Checkout with cart items
- Order placement with Saga pattern
- View order history with status
- Payment and stock status tracking

## Styling

- **Bootstrap 5.3**: For responsive design and components
- **Custom SCSS**: Additional styling in component files
- **Bootstrap Icons**: For UI icons

## Notes

- Images: Currently using a default SVG placeholder for all products
- To add custom product images, replace the file at `src/assets/images/default.svg`
- The application uses standalone components (Angular 17+ feature)
- All forms use template-driven forms with ngModel

## Testing

```bash
# Run unit tests
npm test
```

## Additional Information

- The frontend uses Angular's standalone components
- All HTTP requests use Angular's HttpClient
- RxJS observables for async operations
- Bootstrap for styling (CDN-based)

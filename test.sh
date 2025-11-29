#!/bin/bash
# A simple script to test the full e-commerce flow.

# --- Configuration ---
# Set this to your API Gateway's port (e.g., 3008)
export GATEWAY_URL="http://localhost:3008" 

# --- Create a unique email every time ---
export DYNAMIC_ID=$(date +%s)
export EMAIL="saurabh-$DYNAMIC_ID@test.com"
echo "--- Using dynamic email: $EMAIL ---"
echo -e "\n"


# --- 1. Health Check (Testing API Gateway) ---
curl $GATEWAY_URL/health
echo -e "\n"

# --- 2. Register a New User ---
echo "--- 2. Registering a new user... ---"

# !!!!!!!!!!!!!!!! THIS IS THE FIX !!!!!!!!!!!!!!!!
# We are changing '.userId' to '._id' to match your server's response
USER_ID=$(curl -s -X POST "$GATEWAY_URL/user/register" \
-H "Content-Type: application/json" \
-d '{"name": "Saurabh", "email": "'"$EMAIL"'", "password": "password123"}' | jq -r '._id')

if [ -z "$USER_ID" ] || [ "$USER_ID" == "null" ]; then
    echo "ERROR: User registration failed. 'jq' might not be installed."
else
    echo "USER_ID set to: $USER_ID"
fi
echo -e "\n"


# --- 3. Login and Get Auth Token ---
echo "--- 3. Logging in... ---"
USER_TOKEN=$(curl -s -X POST "$GATEWAY_URL/user/login" \
-H "Content-Type: application/json" \
-d '{"email": "'"$EMAIL"'", "password": "password123"}' | jq -r '.token')

if [ -z "$USER_TOKEN" ] || [ "$USER_TOKEN" == "null" ]; then
    echo "ERROR: Login failed."
else
    echo "USER_TOKEN set to: $USER_TOKEN"
fi
echo -e "\n"


# --- 4. Create a New Product (as Admin) ---
echo "--- 4. Creating a new product... ---"
# This one was already correct
PRODUCT_ID=$(curl -s -X POST "$GATEWAY_URL/product" \
-H "Content-Type: application/json" \
-d '{"name": "Pixel 9 Pro", "description": "The new Google phone", "price": 1099, "category": "Phones"}' | jq -r '._id')

if [ -z "$PRODUCT_ID" ] || [ "$PRODUCT_ID" == "null" ]; then
    echo "ERROR: Product creation failed."
else
    echo "PRODUCT_ID set to: $PRODUCT_ID"
fi
echo -e "\n"


# --- 5. Add Stock for that Product ---
echo "--- 5. Adding 50 units of stock... ---"
curl -X POST "$GATEWAY_URL/inventory" \
-H "Content-Type: application/json" \
-d '{"productId": "'"$PRODUCT_ID"'", "quantity": 50}'
echo -e "\n"


# --- 6. Add Product to Cart ---
echo "--- 6. Adding 2 units of the product to cart... ---"
echo "!!! WATCH YOUR LOGS NOW for gRPC calls !!!"
# This will now work because $USER_ID is correctly set
curl -X POST "$GATEWAY_URL/cart" \
-H "Content-Type: application/json" \
-d '{"userId": "'"$USER_ID"'", "productId": "'"$PRODUCT_ID"'", "quantity": 2}'
echo -e "\n"


# --- 7. PLACE THE ORDER (The SAGA) ---
echo "--- 7. PLACING THE ORDER... ---"
echo "!!! THIS IS THE BIG ONE. WATCH YOUR LOGS. !!!"
# This will now work because $USER_ID is correctly set
# and your Order.js model is fixed.
curl -X POST "$GATEWAY_URL/order" \
-H "Content-Type: application/json" \
-d '{
    "userId": "'"$USER_ID"'",
    "items": [
        {
            "productId": "'"$PRODUCT_ID"'",
            "price": 1099,
            "quantity": 2
        }
    ],
    "totalAmount": 2198
}'
echo -e "\n"

echo "--- TEST COMPLETE ---"
echo "Check your 'npm run dev' terminal. You should see a storm of activity."
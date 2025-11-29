


#!/bin/bash

# This script will 'cd' into each service directory and run 'npm install'.

# Define all service directories
SERVICES=(
  "api-gateway"
  "product-service"
)

# Get the current directory
START_DIR=$(pwd)

# Loop through each service
for service in "${SERVICES[@]}"; do
  echo "----------------------------------------"
  echo "Installing dependencies for: $service"
  echo "----------------------------------------"
  
  if [ -d "$service" ]; then
    cd "$service"  # Go into the service directory
    npm install      # Run npm install
    cd "$START_DIR"  # Go back to the root
  else
    echo "Warning: Directory $service not found."
  fi
done

echo "----------------------------------------"
echo "All dependencies installed."
echo "----------------------------------------"
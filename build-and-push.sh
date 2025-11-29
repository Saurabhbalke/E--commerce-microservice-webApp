#!/bin/bash

# Build and Push Docker Images for E-Commerce Microservices
# Author: Saurabh Balke
# Docker Hub Username: saurabhbalke

set -e

DOCKER_USERNAME="saurabhbalke"
VERSION="latest"

echo "========================================="
echo "Building and Pushing Docker Images"
echo "Docker Hub Username: $DOCKER_USERNAME"
echo "========================================="

# Login to Docker Hub
echo ""
echo "Please login to Docker Hub:"
docker login

# Copy protos to services that need them
echo ""
echo ">>> Copying proto files to services..."
cp -r ./protos ./user-service/protos
cp -r ./protos ./product-service/protos
cp -r ./protos ./cart-service/protos
echo "✅ Proto files copied"

# Copy shared folder to services that need RabbitMQ
echo ""
echo ">>> Copying shared folder to services..."
cp -r ./shared ./order-service/shared
cp -r ./shared ./payment-service/shared
cp -r ./shared ./inventory-service/shared
cp -r ./shared ./notification-service/shared
echo "✅ Shared folder copied"

# Function to build and push image
build_and_push() {
    SERVICE_NAME=$1
    SERVICE_DIR=$2
    
    echo ""
    echo ">>> Building $SERVICE_NAME..."
    docker build -t $DOCKER_USERNAME/ecom-$SERVICE_NAME:$VERSION $SERVICE_DIR
    
    echo ">>> Pushing $SERVICE_NAME to Docker Hub..."
    docker push $DOCKER_USERNAME/ecom-$SERVICE_NAME:$VERSION
    
    echo "✅ $SERVICE_NAME completed!"
}

# Function to cleanup copied files after build
cleanup_copied_files() {
    echo ""
    echo ">>> Cleaning up copied files..."
    rm -rf ./user-service/protos
    rm -rf ./product-service/protos
    rm -rf ./cart-service/protos
    rm -rf ./order-service/shared
    rm -rf ./payment-service/shared
    rm -rf ./inventory-service/shared
    rm -rf ./notification-service/shared
    echo "✅ Cleanup done"
}

# Build and push all services
build_and_push "user-service" "./user-service"
build_and_push "product-service" "./product-service"
build_and_push "cart-service" "./cart-service"
build_and_push "order-service" "./order-service"
build_and_push "payment-service" "./payment-service"
build_and_push "inventory-service" "./inventory-service"
build_and_push "notification-service" "./notification-service"
build_and_push "api-gateway" "./api-gateway"
build_and_push "frontend" "./frontend-service"

# Cleanup copied files
cleanup_copied_files

echo ""
echo "========================================="
echo "✅ All images built and pushed successfully!"
echo "========================================="
echo ""
echo "Docker Hub Images:"
echo "  - $DOCKER_USERNAME/ecom-user-service:$VERSION"
echo "  - $DOCKER_USERNAME/ecom-product-service:$VERSION"
echo "  - $DOCKER_USERNAME/ecom-cart-service:$VERSION"
echo "  - $DOCKER_USERNAME/ecom-order-service:$VERSION"
echo "  - $DOCKER_USERNAME/ecom-payment-service:$VERSION"
echo "  - $DOCKER_USERNAME/ecom-inventory-service:$VERSION"
echo "  - $DOCKER_USERNAME/ecom-notification-service:$VERSION"
echo "  - $DOCKER_USERNAME/ecom-api-gateway:$VERSION"
echo "  - $DOCKER_USERNAME/ecom-frontend:$VERSION"
echo ""
echo "Next steps:"
echo "  1. Verify images on Docker Hub: https://hub.docker.com/u/$DOCKER_USERNAME"
echo "  2. Deploy to Kubernetes: kubectl apply -f k8s-deployment.yaml"
echo ""

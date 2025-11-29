#!/bin/bash

# Quick Deployment Script for Kubernetes
# Deploys the entire e-commerce application with one command

set -e

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║     E-Commerce Microservices - Kubernetes Deployment                 ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi
echo "✅ kubectl found"

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster."
    echo "   Please ensure your cluster is running and kubeconfig is configured."
    exit 1
fi
echo "✅ Connected to Kubernetes cluster"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Deploying application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Deploy
echo ">>> Applying Kubernetes manifests..."
kubectl apply -f k8s-deployment.yaml

echo ""
echo ">>> Waiting for pods to be ready (this may take 2-3 minutes)..."
kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=300s || {
    echo "⚠️  Some pods are not ready yet. Checking status..."
    kubectl get pods -n ecommerce
    echo ""
    echo "Run 'kubectl get pods -n ecommerce' to check status"
    exit 0
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show deployment status
echo "📊 Deployment Status:"
echo ""
kubectl get deployments -n ecommerce
echo ""

echo "📦 Pods:"
echo ""
kubectl get pods -n ecommerce
echo ""

echo "🌐 Services:"
echo ""
kubectl get svc -n ecommerce
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Access Your Application:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option 1: Port Forward (Quickest)"
echo "  kubectl port-forward -n ecommerce svc/frontend 8080:80"
echo "  Then open: http://localhost:8080"
echo ""
echo "Option 2: Get LoadBalancer IP (Cloud)"
echo "  kubectl get svc frontend -n ecommerce"
echo "  Then open: http://<EXTERNAL-IP>"
echo ""
echo "Option 3: Minikube Service (Local)"
echo "  minikube service frontend -n ecommerce"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Useful Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "View logs:"
echo "  kubectl logs -n ecommerce deployment/user-service -f"
echo ""
echo "Scale service:"
echo "  kubectl scale deployment user-service -n ecommerce --replicas=3"
echo ""
echo "Delete deployment:"
echo "  kubectl delete namespace ecommerce"
echo ""
echo "Full documentation: KUBERNETES_DEPLOYMENT_GUIDE.md"
echo ""

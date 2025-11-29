# Kubernetes Deployment Guide

## E-Commerce Microservices on Kubernetes

Complete guide to deploy the entire e-commerce application on Kubernetes using a single command.

---

## 📋 Prerequisites

### 1. Kubernetes Cluster
You need a running Kubernetes cluster. Options:

**Local Development:**
- **Minikube**: `minikube start --cpus=4 --memory=8192`
- **Kind**: `kind create cluster`
- **Docker Desktop**: Enable Kubernetes in settings

**Cloud:**
- **GKE** (Google Kubernetes Engine)
- **EKS** (Amazon Elastic Kubernetes Service)
- **AKS** (Azure Kubernetes Service)
- **DigitalOcean Kubernetes**

### 2. kubectl
```bash
# Check kubectl is installed
kubectl version --client

# Install if needed (Linux)
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

### 3. Docker (for building images)
```bash
docker --version
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Clone Repository
```bash
git clone https://github.com/Saurabhbalke/E--commerce-microservice-webApp.git
cd E--commerce-microservice-webApp
```

### Step 2: Build and Push Docker Images
```bash
# Make script executable
chmod +x build-and-push.sh

# Build and push all images to Docker Hub
./build-and-push.sh
```

This will:
- Build Docker images for all 9 services
- Push them to Docker Hub (saurabhbalke/ecom-*)
- Takes approximately 10-15 minutes

### Step 3: Deploy to Kubernetes
```bash
# Deploy everything with one command
kubectl apply -f k8s-deployment.yaml

# Wait for all pods to be ready (takes 2-3 minutes)
kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=300s
```

---

## 📦 What Gets Deployed

### Infrastructure Services
- **MongoDB** - Database (with persistent storage)
- **RabbitMQ** - Message broker for saga pattern

### Backend Microservices (8 services)
- **User Service** - Authentication & user management
- **Product Service** - Product catalog
- **Cart Service** - Shopping cart management
- **Order Service** - Order orchestration (saga)
- **Payment Service** - Payment processing
- **Inventory Service** - Stock management
- **Notification Service** - Email notifications
- **API Gateway** - Single entry point

### Frontend
- **Angular App** - Modern UI (Nginx served)

### Total Pods: ~15-20 (with 2 replicas each)

---

## 🔍 Verify Deployment

### Check All Pods
```bash
kubectl get pods -n ecommerce
```

Expected output:
```
NAME                                   READY   STATUS    RESTARTS   AGE
mongodb-xxxxx                          1/1     Running   0          2m
rabbitmq-xxxxx                         1/1     Running   0          2m
user-service-xxxxx                     1/1     Running   0          2m
user-service-yyyyy                     1/1     Running   0          2m
product-service-xxxxx                  1/1     Running   0          2m
...
```

### Check Services
```bash
kubectl get svc -n ecommerce
```

### Check Deployments
```bash
kubectl get deployments -n ecommerce
```

### View Logs
```bash
# Specific service
kubectl logs -n ecommerce deployment/user-service -f

# All services
kubectl logs -n ecommerce -l app=user-service --tail=50
```

---

## 🌐 Access the Application

### Option 1: Port Forward (Quick Test)
```bash
# Access frontend
kubectl port-forward -n ecommerce svc/frontend 8080:80

# Access API Gateway
kubectl port-forward -n ecommerce svc/api-gateway 3008:3008

# Access RabbitMQ Management UI
kubectl port-forward -n ecommerce svc/rabbitmq 15672:15672
```

Then open:
- Frontend: http://localhost:8080
- API Gateway: http://localhost:3008/health
- RabbitMQ UI: http://localhost:15672 (guest/guest)

### Option 2: LoadBalancer (Cloud)
```bash
# Get external IP
kubectl get svc frontend -n ecommerce

# Wait for EXTERNAL-IP to be assigned
# Access: http://<EXTERNAL-IP>
```

### Option 3: NodePort (Local)
```bash
# Edit frontend service to NodePort
kubectl patch svc frontend -n ecommerce -p '{"spec":{"type":"NodePort"}}'

# Get NodePort
kubectl get svc frontend -n ecommerce

# Access with Minikube
minikube service frontend -n ecommerce
```

### Option 4: Ingress (Production)
```bash
# Install Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Add to /etc/hosts
echo "127.0.0.1 ecommerce.local" | sudo tee -a /etc/hosts

# Access: http://ecommerce.local
```

---

## 🔧 Configuration

### Update Environment Variables
Edit ConfigMap in `k8s-deployment.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: service-config
  namespace: ecommerce
data:
  MONGO_URI: "mongodb://mongodb:27017"
  RABBIT_URI: "amqp://guest:guest@rabbitmq:5672"
```

Apply changes:
```bash
kubectl apply -f k8s-deployment.yaml
kubectl rollout restart deployment -n ecommerce
```

### Update JWT Secret
```bash
kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET='your-new-secret-key' \
  -n ecommerce --dry-run=client -o yaml | kubectl apply -f -
```

### Scale Services
```bash
# Scale specific service
kubectl scale deployment user-service -n ecommerce --replicas=3

# Scale all services
kubectl scale deployment --all -n ecommerce --replicas=3
```

---

## 🧪 Testing the Application

### 1. Health Check
```bash
# API Gateway health
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n ecommerce -- \
  curl http://api-gateway:3008/health
```

### 2. Create Test Data
```bash
# Port forward to product service
kubectl port-forward -n ecommerce svc/product-service 3002:3002

# Insert test products (run on local machine)
curl -X POST http://localhost:3002/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High performance laptop",
    "price": 1299.99,
    "category": "electronics"
  }'
```

### 3. Register User
```bash
kubectl port-forward -n ecommerce svc/api-gateway 3008:3008

curl -X POST http://localhost:3008/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Test Saga Pattern
Place an order and watch the logs:
```bash
# Terminal 1: Order service
kubectl logs -n ecommerce deployment/order-service -f

# Terminal 2: Inventory service
kubectl logs -n ecommerce deployment/inventory-service -f

# Terminal 3: Payment service
kubectl logs -n ecommerce deployment/payment-service -f

# Terminal 4: Place order via frontend or API
```

---

## 📊 Monitoring

### Resource Usage
```bash
# Pod resource usage
kubectl top pods -n ecommerce

# Node resource usage
kubectl top nodes
```

### Events
```bash
# Watch events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'

# Specific pod events
kubectl describe pod <pod-name> -n ecommerce
```

### RabbitMQ Management
```bash
# Port forward
kubectl port-forward -n ecommerce svc/rabbitmq 15672:15672

# Access: http://localhost:15672
# Credentials: guest/guest
```

---

## 🗑️ Cleanup

### Delete Everything
```bash
# Delete all resources in namespace
kubectl delete namespace ecommerce

# This removes:
# - All deployments
# - All services
# - All pods
# - All configmaps/secrets
# - Persistent volume claims
```

### Delete Specific Service
```bash
kubectl delete deployment user-service -n ecommerce
kubectl delete svc user-service -n ecommerce
```

---

## 🐛 Troubleshooting

### Pods Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n ecommerce

# Common issues:
# 1. Image pull errors - verify Docker Hub images exist
# 2. Resource constraints - check node capacity
# 3. Config errors - check environment variables
```

### ImagePullBackOff Error
```bash
# Verify images exist on Docker Hub
docker pull saurabhbalke/ecom-user-service:latest

# Check image pull secrets
kubectl get secrets -n ecommerce

# Verify image name in deployment
kubectl get deployment user-service -n ecommerce -o yaml | grep image
```

### CrashLoopBackOff
```bash
# View logs
kubectl logs -n ecommerce <pod-name> --previous

# Common causes:
# 1. MongoDB not ready - wait longer
# 2. Missing environment variables
# 3. Service dependencies not available
```

### Service Not Accessible
```bash
# Check service endpoints
kubectl get endpoints -n ecommerce

# Test internal connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n ecommerce -- \
  curl http://user-service:3001/health
```

### MongoDB Connection Issues
```bash
# Check MongoDB pod
kubectl logs -n ecommerce deployment/mongodb

# Test MongoDB connection
kubectl run -it --rm mongo-client --image=mongo:5.0 --restart=Never -n ecommerce -- \
  mongo mongodb://mongodb:27017/test --eval "db.version()"
```

### RabbitMQ Issues
```bash
# Check RabbitMQ logs
kubectl logs -n ecommerce deployment/rabbitmq

# Access management UI
kubectl port-forward -n ecommerce svc/rabbitmq 15672:15672
```

---

## 🔐 Security Best Practices

### 1. Update Secrets
```bash
# Generate strong JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Update secret
kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  -n ecommerce --dry-run=client -o yaml | kubectl apply -f -
```

### 2. Use Private Registry (Production)
```yaml
# Add imagePullSecrets to deployments
spec:
  template:
    spec:
      imagePullSecrets:
      - name: dockerhub-secret
```

### 3. Network Policies
Create network policies to restrict traffic between services.

### 4. Resource Limits
Already configured in deployment with:
- Memory limits
- CPU limits
- Request guarantees

---

## 📈 Production Recommendations

### 1. High Availability
```yaml
# Increase replicas
replicas: 3

# Add pod anti-affinity
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchLabels:
            app: user-service
        topologyKey: kubernetes.io/hostname
```

### 2. Persistent Storage
```yaml
# Use StorageClass for dynamic provisioning
storageClassName: fast-ssd
```

### 3. Monitoring & Logging
- **Prometheus** for metrics
- **Grafana** for dashboards
- **ELK Stack** or **Loki** for logs
- **Jaeger** for distributed tracing

### 4. Auto-scaling
```bash
# Horizontal Pod Autoscaler
kubectl autoscale deployment user-service \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n ecommerce
```

### 5. Backup Strategy
- Regular MongoDB backups
- GitOps for configuration
- Disaster recovery plan

---

## 📚 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Kubernetes Cluster                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                Frontend (LoadBalancer)                │  │
│  │                  Angular + Nginx                      │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │                  API Gateway                          │  │
│  │                  (ClusterIP)                          │  │
│  └──┬──────┬──────┬──────┬──────┬──────┬──────┬─────────┘  │
│     │      │      │      │      │      │      │            │
│  ┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐       │
│  │User││Prod││Cart││Ord││Pay││Inv││Noti│              │
│  │Svc ││Svc ││Svc ││Svc ││Svc││Svc││Svc │              │
│  └──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘       │
│     │      │      │      │      │      │      │            │
│  ┌──▼──────▼──────▼──────▼──────▼──────▼──────▼────────┐  │
│  │                  MongoDB (PVC)                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │       RabbitMQ (Saga Pattern Messaging)               │  │
│  │         Order ↔ Inventory ↔ Payment                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

✅ All pods running (15-20 pods)
✅ All services accessible
✅ Frontend loads successfully
✅ User can register/login
✅ Products visible
✅ Can add to cart
✅ Can place order
✅ Saga pattern working (check logs)
✅ Notifications sent
✅ No crash loops

---

## 📞 Support

**GitHub**: https://github.com/Saurabhbalke/E--commerce-microservice-webApp
**Issues**: Report bugs via GitHub Issues
**Docker Hub**: https://hub.docker.com/u/saurabhbalke

---

## ✅ Checklist

Before deploying to production:

- [ ] Update all secrets (JWT, database passwords)
- [ ] Configure ingress with TLS
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Set up backup strategy
- [ ] Configure autoscaling
- [ ] Implement network policies
- [ ] Set resource limits appropriately
- [ ] Test disaster recovery
- [ ] Document runbooks

---

**Congratulations! Your e-commerce microservices application is running on Kubernetes! 🎉**

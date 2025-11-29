# E-Commerce Microservices Application

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Pattern](https://img.shields.io/badge/Pattern-Saga-green)
![Platform](https://img.shields.io/badge/Platform-Kubernetes-326CE5)
![Node](https://img.shields.io/badge/Node.js-18-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0-47A248)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.9-FF6600)
![Angular](https://img.shields.io/badge/Angular-17-DD0031)

A production-ready e-commerce application built with microservices architecture, implementing the Saga pattern for distributed transactions, with full Kubernetes deployment support.

---

## 🌟 Features

### Architecture
- **8 Microservices** - Independently deployable and scalable
- **Saga Pattern** - Distributed transaction management with compensation
- **Event-Driven** - RabbitMQ for asynchronous communication
- **gRPC** - High-performance inter-service communication
- **API Gateway** - Single entry point with routing
- **Angular Frontend** - Modern, responsive UI

### Business Features
- User authentication & authorization (JWT)
- Product catalog management
- Shopping cart with real-time updates
- Order processing with saga orchestration
- Payment processing (with 10% simulated failure for testing)
- Inventory management with atomic stock reservation
- Email notifications
- Order tracking

### Technical Highlights
- **Race Condition Fixes** - Atomic stock operations prevent overselling
- **Idempotency** - Message deduplication for saga reliability
- **Containerized** - Docker images for all services
- **Kubernetes Ready** - Complete K8s deployment manifests
- **Production Ready** - Health checks, resource limits, scaling configured

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                        │
│                  Nginx + Angular 17                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   API Gateway                                 │
│              Express.js + CORS + Proxy                       │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬───────────────┘
   │      │      │      │      │      │      │
┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐
│User ││Prod ││Cart ││Order││Pay  ││Inv  ││Notif│
│Svc  ││Svc  ││Svc  ││Svc  ││Svc  ││Svc  ││Svc  │
└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘
   │      │      │      │      │      │      │
   │      │      │  ┌───▼──────▼──────▼──────▼───┐
   │      │      │  │     RabbitMQ (Saga)         │
   │      │      │  │  Order ↔ Inventory ↔ Pay   │
   │      │      │  └────────────────────────────┘
   │      │      │
┌──▼──────▼──────▼──────────────────────────────────┐
│           MongoDB (Shared Database)                │
│  user_db | product_db | cart_db | order_db | ...  │
└────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Hub account
- Kubernetes cluster (Minikube, Kind, GKE, EKS, AKS)
- kubectl CLI
- Git

### Deploy to Kubernetes (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/Saurabhbalke/E--commerce-microservice-webApp.git
cd E--commerce-microservice-webApp

# 2. Build and push Docker images (one-time setup)
./build-and-push.sh

# 3. Deploy to Kubernetes
kubectl apply -f k8s-deployment.yaml

# 4. Wait for deployment (2-3 minutes)
kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=300s

# 5. Access application
kubectl port-forward -n ecommerce svc/frontend 8080:80
# Open: http://localhost:8080
```

**That's it!** Your entire application is running on Kubernetes.

---

## 📦 Services Overview

| Service | Port | Description | Technology |
|---------|------|-------------|------------|
| **Frontend** | 80 | Angular UI | Angular 17 + Nginx |
| **API Gateway** | 3008 | Entry point | Express.js |
| **User Service** | 3001 | Auth & users | Node.js + JWT |
| **Product Service** | 3002 | Product catalog | Node.js + gRPC |
| **Cart Service** | 3003 | Shopping cart | Node.js + gRPC |
| **Order Service** | 3004 | Order orchestration | Node.js + RabbitMQ |
| **Payment Service** | 3005 | Payments | Node.js + RabbitMQ |
| **Inventory Service** | 3006 | Stock mgmt | Node.js + RabbitMQ |
| **Notification Service** | - | Notifications | Node.js + RabbitMQ |
| **MongoDB** | 27017 | Database | MongoDB 5.0 |
| **RabbitMQ** | 5672, 15672 | Message broker | RabbitMQ 3.9 |

---

## 🐳 Docker Images

All images are available on Docker Hub:

```
saurabhbalke/ecom-user-service:latest
saurabhbalke/ecom-product-service:latest
saurabhbalke/ecom-cart-service:latest
saurabhbalke/ecom-order-service:latest
saurabhbalke/ecom-payment-service:latest
saurabhbalke/ecom-inventory-service:latest
saurabhbalke/ecom-notification-service:latest
saurabhbalke/ecom-api-gateway:latest
saurabhbalke/ecom-frontend:latest
```

---

## 🎯 Saga Pattern Implementation

### Order Placement Flow

```
1. User places order → Order Service (PENDING)
   ↓
2. Order Service publishes: order.created
   ↓
   ├─→ Inventory Service checks/reserves stock
   │   ├─ Success → publishes: stock.reserved
   │   └─ Failure → publishes: stock.reservation_failed
   │
   └─→ Payment Service processes payment (parallel)
       ├─ Success → publishes: payment.processed
       └─ Failure → publishes: payment.failed
   ↓
3. Order Service listens to both responses
   ├─ Both SUCCESS → Order CONFIRMED ✅
   └─ Any FAILED → Order CANCELLED + Compensation ❌
   ↓
4. Compensation (if needed)
   └─→ Stock released (stock.release event)
   ↓
5. Notification Service sends email
   ├─ order.confirmed → Success email
   └─ order.cancelled → Failure email
```

### Key Features
- **Parallel Execution** - Inventory and payment process simultaneously
- **Atomic Operations** - Stock reservation prevents race conditions
- **Idempotency** - Duplicate messages handled gracefully
- **Compensation** - Stock released on any failure
- **Observability** - Full event logging

---

## 🔧 Local Development

### Option 1: Kubernetes (Recommended)
```bash
# Start Minikube
minikube start --cpus=4 --memory=8192

# Deploy
kubectl apply -f k8s-deployment.yaml

# Access
minikube service frontend -n ecommerce
```

### Option 2: Docker Compose
```bash
# Start infrastructure
docker-compose up -d

# Install dependencies
npm install

# Start all services
npm run dev
```

### Option 3: Local Node.js
```bash
# 1. Start MongoDB
docker run -d -p 27017:27017 mongo:5.0

# 2. Start RabbitMQ
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3.9-management

# 3. Install dependencies in root
npm install

# 4. Start all services
npm run dev

# 5. Start frontend (separate terminal)
cd frontend-service
npm install
npm start
```

---

## 📚 Documentation

- **[Kubernetes Deployment Guide](KUBERNETES_DEPLOYMENT_GUIDE.md)** - Complete K8s deployment instructions
- **[Backend Logic Review](BACKEND_LOGIC_REVIEW.md)** - Architecture analysis
- **[Race Condition Fixes](RACE_CONDITION_FIXES_APPLIED.md)** - Technical details
- **[Frontend Setup](FRONTEND_SETUP_GUIDE.md)** - Frontend development guide
- **[Git Setup](GIT_SETUP_COMPLETE.md)** - Repository configuration

---

## 🧪 Testing

### Health Checks
```bash
# API Gateway
curl http://localhost:3008/health

# All services
for port in 3001 3002 3003 3004 3005 3006; do
  curl -s http://localhost:$port/health || echo "Port $port not responding"
done
```

### Create Test Data
```bash
# Register user
curl -X POST http://localhost:3008/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'

# Add product
curl -X POST http://localhost:3008/product \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"Gaming laptop","price":1299.99,"category":"electronics"}'

# Set inventory
curl -X POST http://localhost:3006 \
  -H "Content-Type: application/json" \
  -d '{"productId":"<PRODUCT_ID>","quantity":10}'
```

### Test Saga Pattern
```bash
# Watch logs in separate terminals
kubectl logs -n ecommerce deployment/order-service -f
kubectl logs -n ecommerce deployment/inventory-service -f
kubectl logs -n ecommerce deployment/payment-service -f

# Place order via frontend and observe saga execution
```

---

## 🔍 Monitoring

### Kubernetes Dashboard
```bash
# Install dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# Create admin user
kubectl create serviceaccount dashboard-admin -n kubernetes-dashboard
kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-admin

# Get token
kubectl create token dashboard-admin -n kubernetes-dashboard

# Access dashboard
kubectl proxy
# Open: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

### RabbitMQ Management
```bash
kubectl port-forward -n ecommerce svc/rabbitmq 15672:15672
# Open: http://localhost:15672 (guest/guest)
```

### Logs
```bash
# All services
kubectl logs -n ecommerce -l app=user-service --tail=100

# Specific pod
kubectl logs -n ecommerce <pod-name> -f

# Previous crashed pod
kubectl logs -n ecommerce <pod-name> --previous
```

---

## 📈 Scaling

### Manual Scaling
```bash
# Scale specific service
kubectl scale deployment user-service -n ecommerce --replicas=5

# Scale all services
kubectl scale deployment --all -n ecommerce --replicas=3
```

### Auto-scaling
```bash
# Enable HPA
kubectl autoscale deployment user-service -n ecommerce \
  --cpu-percent=70 \
  --min=2 \
  --max=10
```

---

## 🛡️ Security

### Production Checklist
- [x] JWT secret externalized (Kubernetes Secret)
- [x] No hardcoded credentials
- [x] Resource limits configured
- [x] Health checks implemented
- [ ] HTTPS/TLS configured (add Ingress with cert-manager)
- [ ] Network policies defined
- [ ] RBAC configured
- [ ] Secrets encrypted at rest
- [ ] Container images scanned
- [ ] Regular security updates

---

## 🗑️ Cleanup

### Delete Kubernetes Deployment
```bash
# Delete entire namespace
kubectl delete namespace ecommerce

# Or delete specific resources
kubectl delete -f k8s-deployment.yaml
```

### Stop Local Development
```bash
# Docker Compose
docker-compose down -v

# Kill Node processes
pkill -f "node"

# Minikube
minikube stop
minikube delete
```

---

## 🐛 Troubleshooting

### Pods Not Starting
```bash
# Check pod status
kubectl get pods -n ecommerce

# Describe problematic pod
kubectl describe pod <pod-name> -n ecommerce

# View logs
kubectl logs <pod-name> -n ecommerce
```

### Common Issues

**ImagePullBackOff**: Images not found on Docker Hub
```bash
# Verify images exist
docker pull saurabhbalke/ecom-user-service:latest

# Or build and push again
./build-and-push.sh
```

**CrashLoopBackOff**: Application crashing
```bash
# Check logs
kubectl logs <pod-name> -n ecommerce --previous

# Common causes:
# - MongoDB not ready (wait 30s)
# - Missing environment variables
# - Service dependencies unavailable
```

**Service Not Accessible**: Network issues
```bash
# Check service
kubectl get svc -n ecommerce

# Check endpoints
kubectl get endpoints -n ecommerce

# Test internally
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n ecommerce -- \
  curl http://user-service:3001/health
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

**Saurabh Balke**
- GitHub: [@Saurabhbalke](https://github.com/Saurabhbalke)
- Docker Hub: [saurabhbalke](https://hub.docker.com/u/saurabhbalke)

---

## 🙏 Acknowledgments

- Microservices architecture patterns
- Saga pattern implementation
- Kubernetes deployment best practices
- Open source community

---

## 📊 Project Stats

- **Services**: 8 microservices + 1 gateway + 1 frontend
- **Lines of Code**: ~5,000+
- **Docker Images**: 9
- **Kubernetes Resources**: 30+ (deployments, services, configs, secrets)
- **Technologies**: 10+ (Node.js, MongoDB, RabbitMQ, Angular, Docker, Kubernetes, gRPC, JWT, Nginx)

---

**⭐ Star this repo if you found it helpful!**

**🚀 Happy deploying!**

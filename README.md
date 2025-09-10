# Excalidraw Collaboration - Enhanced Fork

## What's New in This Fork

This enhanced version adds enterprise-grade features and deployment options to the original project:

### Key Additions

1. **Production HTTPS Setup** (`/local-https/`)
   - Complete SSL/TLS configuration with nginx reverse proxy
   - Self-signed certificates for local development
   - **Fixes collaboration features** - solves the `crypto.subtle` API requirement
   - Ready for production with proper certificate management

2. **Kubernetes Deployment** (`/k8s/`)
   - Production-ready Kubernetes manifests with Kustomize
   - Ingress configuration with automatic SSL via cert-manager
   - Horizontal pod autoscaling and health checks
   - ConfigMap-based configuration management

3. **OpenShift Support** (`/openshift/`)
   - Native OpenShift DeploymentConfigs and ImageStreams
   - Route configuration with edge SSL termination
   - Container security contexts and resource quotas
   - OpenShift-specific networking and service mesh integration

4. **Security & Documentation**
   - Comprehensive security review report ([SECURITY_REVIEW_REPORT.md](SECURITY_REVIEW_REPORT.md))
   - Container vulnerability analysis
   - Production deployment guides ([DEPLOYMENT_DOCUMENTATION.md](DEPLOYMENT_DOCUMENTATION.md))
   - Security best practices and hardening recommendations

## Original vs Enhanced Comparison

| Feature | Original alswl/excalidraw-collaboration | This Enhanced Fork |
|---------|----------------------------------------|-------------------|
| **Basic Docker Setup** | HTTP only | HTTP + **HTTPS with SSL** |
| **Collaboration Features** | Limited (crypto.subtle issues) | **Fully working** |
| **Production Deployment** | Manual setup required | **K8s + OpenShift ready** |
| **SSL/TLS Support** | Advanced nginx only | **Complete HTTPS setup** |
| **Security Documentation** | Not included | **Comprehensive review** |
| **Container Orchestration** | Docker Compose only | **K8s + OpenShift manifests** |
| **Certificate Management** | Manual | **Automated with cert-manager** |

## Architecture

```
┌─────────────────┐    HTTPS     ┌─────────────────────┐
│   User Browser  │◄────────────►│   Nginx Proxy       │
│                 │   (443/8443) │   SSL Termination   │
└─────────────────┘              └──────────┬──────────┘
                                            │
                                ┌───────────┼───────────┐
                                ▼           ▼           ▼
                        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
                        │ Frontend    │ │ Storage     │ │ Room        │
                        │ (Excalidraw)│ │ Backend     │ │ Service     │
                        │ Port 80     │ │ Port 8080   │ │ Port 80     │
                        └─────────────┘ └─────────────┘ └─────────────┘
```

## Quick Start Options

### 1. Enhanced HTTPS Setup (Recommended)

**Why HTTPS?** Excalidraw's collaboration features require the `crypto.subtle` Web API, which is only available in secure contexts (HTTPS).

```bash
git clone https://github.com/mueslipolo/excalidraw-collab.git
cd excalidraw-collab/local-https
docker-compose up -d

# Access at: https://localhost:8443
# Accept certificate warning for self-signed cert in development
```

### 2. Original HTTP Setup (Limited Functionality)

```bash
cd excalidraw-collab/basic
docker-compose up -d

# Access at: http://localhost:8080
# Note: Collaboration features won't work due to crypto.subtle requirement
```

### 3. Kubernetes Production Deployment

```bash
cd k8s/
# Edit kustomization.yaml with your domain
kubectl apply -k .
kubectl get pods -n excalidraw-collab -w
```

### 4. OpenShift Deployment

```bash
cd openshift/
oc new-project excalidraw-collab
oc apply -f .
oc create route edge --service=nginx-proxy
```

## Configuration

### Environment Variables

| Variable | Purpose | Default Value |
|----------|---------|---------------|
| `VITE_APP_HTTP_STORAGE_BACKEND_URL` | Storage API URL | `https://localhost:8443/api/v2` |
| `VITE_APP_WS_SERVER_URL` | WebSocket server URL | `https://localhost:8443` |
| `VITE_APP_BACKEND_V2_GET_URL` | GET API endpoint | `https://localhost:8443/api/v2/scenes/` |
| `VITE_APP_BACKEND_V2_POST_URL` | POST API endpoint | `https://localhost:8443/api/v2/scenes/` |
| `VITE_APP_DISABLE_TRACKING` | Disable analytics | `true` |

**For Production:** Replace all `localhost:8443` references with your actual domain.

## Security

### Security Status: SAFE TO USE

A comprehensive security review has been conducted - see [SECURITY_REVIEW_REPORT.md](SECURITY_REVIEW_REPORT.md).

**Key Security Features:**
- **HTTPS Mandatory**: Collaboration requires secure context
- **No Hardcoded Secrets**: Configuration via environment variables  
- **Container Security**: Non-privileged containers with security contexts
- **Network Isolation**: Internal service communication
- **Privacy Focused**: Tracking disabled by default

## Documentation

- **[DEPLOYMENT_DOCUMENTATION.md](DEPLOYMENT_DOCUMENTATION.md)** - Complete production deployment guide
- **[SECURITY_REVIEW_REPORT.md](SECURITY_REVIEW_REPORT.md)** - Security analysis and recommendations
- **[k8s/README.md](k8s/README.md)** - Kubernetes-specific deployment instructions
- **[openshift/README.md](openshift/README.md)** - OpenShift deployment guide

## Common Issues & Solutions

### "crypto.subtle is undefined" Error
**Problem:** Collaboration features don't work  
**Solution:** Use the HTTPS setup instead of HTTP-only setup

### Certificate Warnings
**Problem:** Browser shows security warnings  
**Solution:** Expected with self-signed certificates - click "Advanced" → "Proceed to site"

## Resource Requirements

### Minimum Production Resources

| Service | CPU | Memory | Storage | Scaling |
|---------|-----|--------|---------|---------|
| Frontend | 100m | 128Mi | - | Horizontal |
| Storage Backend | 200m | 256Mi | - | Horizontal |
| Room Service | 100m | 128Mi | - | Horizontal |
| Nginx Proxy | 50m | 64Mi | - | Horizontal |
| MongoDB* | 500m | 512Mi | 10Gi+ | Replica Set |

*MongoDB not included in basic setup but recommended for production

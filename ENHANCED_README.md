# Enhanced Excalidraw Collaboration - Complete Deployment Guide

This repository contains an enhanced version of `alswl/excalidraw-collaboration` with additional HTTPS support and Kubernetes/OpenShift deployment capabilities.

## 🚀 What's Added

### New Components

1. **HTTPS-Enabled Local Setup** (`/local-https/`)
   - Complete SSL/TLS configuration with nginx reverse proxy
   - Self-signed certificates for development
   - Fixes `crypto.subtle` error that prevents collaboration features

2. **Kubernetes Deployment** (`/k8s/`)
   - Production-ready Kubernetes manifests
   - Ingress configuration with automatic SSL
   - Scalable architecture with health checks

3. **OpenShift Deployment** (`/openshift/`)
   - OpenShift-native DeploymentConfigs and ImageStreams
   - Route configuration with edge SSL termination
   - Container security and resource management

4. **Security Documentation**
   - Comprehensive security review report
   - Container image analysis
   - Best practices and recommendations

## 🏗️ Architecture

```
┌─────────────┐    HTTPS    ┌─────────────────┐
│   Browser   │◄──────────►│  Nginx Proxy    │
│             │   (8443)    │  SSL Termination│
└─────────────┘             └─────────┬───────┘
                                      │
                          ┌───────────┼───────────┐
                          ▼           ▼           ▼
                  ┌──────────┐ ┌──────────┐ ┌──────────┐
                  │Frontend  │ │Storage   │ │Room      │
                  │Service   │ │Backend   │ │Service   │ 
                  │(React)   │ │(API)     │ │(WebSocket│
                  └──────────┘ └──────────┘ └──────────┘
```

## 📦 Installation Options

### 1. Local Development with HTTPS (Recommended)

```bash
git clone https://github.com/alswl/excalidraw-collaboration.git
cd excalidraw-collaboration/local-https
podman-compose up -d

# Access at: https://localhost:8443
# Accept certificate warning for self-signed cert
```

**Why HTTPS?** The collaboration features require `crypto.subtle` API which is only available in secure contexts.

### 2. Original HTTP Setup (Limited functionality)

```bash
cd excalidraw-collaboration/basic
podman-compose up -d

# Access at: http://localhost:8080
# Note: Collaboration features won't work due to crypto.subtle requirement
```

### 3. Kubernetes Production Deployment

```bash
cd k8s/
# Edit kustomization.yaml with your domain
kubectl apply -k .

# Monitor deployment
kubectl get pods -n excalidraw-collab -w
```

See [k8s/README.md](k8s/README.md) for detailed instructions.

### 4. OpenShift Deployment

```bash
cd openshift/
oc new-project excalidraw-collab
oc apply -f .
oc create route edge excalidraw --service=nginx-proxy --port=80

# Get your route URL
oc get route excalidraw
```

See [openshift/README.md](openshift/README.md) for detailed instructions.

## 🔧 Configuration

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_APP_HTTP_STORAGE_BACKEND_URL` | Storage API URL | `https://localhost:8443/api/v2` |
| `VITE_APP_WS_SERVER_URL` | WebSocket URL | `https://localhost:8443` |
| `VITE_APP_BACKEND_V2_GET_URL` | GET API endpoint | `https://localhost:8443/api/v2/scenes/` |
| `VITE_APP_BACKEND_V2_POST_URL` | POST API endpoint | `https://localhost:8443/api/v2/scenes/` |
| `VITE_APP_DISABLE_TRACKING` | Analytics | `true` |

### For Production Deployment

Replace all `localhost:8443` references with your actual domain:
- Update docker-compose environment variables
- Update Kubernetes ConfigMap
- Update OpenShift DeploymentConfig

## 🛡️ Security

### Security Review

A comprehensive security analysis has been performed - see [SECURITY_REVIEW_REPORT.md](SECURITY_REVIEW_REPORT.md).

**Verdict: SAFE TO USE** ✅
- No malicious code detected
- Standard Docker configurations
- Official base images used
- MIT licensed open source

### Security Features

- **HTTPS Mandatory**: Collaboration requires secure context
- **Privacy Focused**: Tracking disabled by default  
- **Container Security**: Non-privileged containers
- **Network Isolation**: Internal service communication

## 🚦 Usage

### Testing Collaboration Features

1. **Open Application**: Navigate to your HTTPS URL
2. **Accept Certificate**: For self-signed certs in development
3. **Create Drawing**: Start drawing on the canvas
4. **Start Collaboration**: Click "Live Collaboration" button
5. **Share URL**: Copy and share the collaboration URL
6. **Multi-user Drawing**: Multiple users can now draw together in real-time!

### Verification Script

Use the included test script to verify crypto.subtle availability:
```bash
# Open browser console at your HTTPS URL
# Run: /local-https/test-collaboration.js
```

## 📊 Resource Requirements

### Minimum Resources

| Service | CPU | Memory | Notes |
|---------|-----|--------|-------|
| Frontend | 100m | 128Mi | Scales horizontally |
| Storage | 200m | 256Mi | API backend |
| Room | 100m | 128Mi | WebSocket service |
| Nginx | 50m | 64Mi | Reverse proxy |

### Production Scaling

- Frontend: Scale based on concurrent users
- Room Service: Scale for WebSocket connections
- Storage Backend: Scale with load balancing
- Database: Consider MongoDB replica set

## 🔍 Monitoring

### Health Checks

```bash
# Local (Podman)
curl -k https://localhost:8443
podman logs local-https_nginx-proxy_1

# Kubernetes  
kubectl get pods -n excalidraw-collab
kubectl logs -f deployment/nginx-proxy -n excalidraw-collab

# OpenShift
oc status
oc logs -f dc/nginx-proxy
```

### Common Issues

1. **"crypto.subtle is undefined"**
   - Solution: Use HTTPS setup instead of HTTP

2. **Certificate warnings**
   - Expected with self-signed certificates
   - Use "Advanced" → "Proceed to site"

3. **WebSocket connection failed**
   - Check proxy configuration
   - Verify route/ingress supports WebSocket upgrade

4. **Collaboration not working**
   - Ensure HTTPS is working
   - Check browser security context: `window.isSecureContext`

## 📚 Documentation

- [DEPLOYMENT_DOCUMENTATION.md](DEPLOYMENT_DOCUMENTATION.md) - Complete deployment guide
- [SECURITY_REVIEW_REPORT.md](SECURITY_REVIEW_REPORT.md) - Security analysis
- [k8s/README.md](k8s/README.md) - Kubernetes-specific instructions  
- [openshift/README.md](openshift/README.md) - OpenShift-specific instructions

## 🔄 Migration

### From Original Setup to HTTPS

1. Stop HTTP containers: `podman-compose down`
2. Switch to HTTPS directory: `cd ../local-https`  
3. Start HTTPS containers: `podman-compose up -d`
4. Update bookmarks to use port 8443

### From Local to Kubernetes

1. Update domain in `k8s/kustomization.yaml`
2. Apply manifests: `kubectl apply -k k8s/`
3. Configure DNS to point to ingress IP
4. Verify HTTPS certificate

## 🤝 Contributing

Enhancements added to original alswl/excalidraw-collaboration:

1. **HTTPS Support**: Complete SSL/TLS setup for collaboration
2. **Container Orchestration**: K8s and OpenShift ready
3. **Security Review**: Comprehensive analysis  
4. **Documentation**: Production deployment guides
5. **Monitoring**: Health checks and logging

## 📄 License

This enhanced version maintains the same MIT license as the original project.

---

**Original Project**: https://github.com/alswl/excalidraw-collaboration  
**Enhancement Focus**: Production-ready HTTPS deployment with container orchestration support.
# Excalidraw Collaboration - Enhanced Deployment Documentation

## Overview

This document describes the additional code and configurations added to the original `alswl/excalidraw-collaboration` repository, along with instructions for deploying on Kubernetes and OpenShift.

## Added Components

### 1. HTTPS-Enabled Local Setup (`/local-https/`)

We added a complete HTTPS setup to resolve the `crypto.subtle` error that prevents collaboration features from working over HTTP.

#### Files Added:

**`local-https/docker-compose.yml`**
- Complete multi-service setup with nginx reverse proxy
- HTTPS termination with self-signed certificates
- Internal container networking for security
- Environment variables configured for HTTPS endpoints

**`local-https/nginx.conf`**
- Nginx reverse proxy configuration
- SSL/TLS termination
- Request routing to backend services:
  - `/` → Frontend service
  - `/api/` → Storage backend
  - `/socket.io/` → WebSocket room service
- HTTP to HTTPS redirect

**`local-https/excalidraw.crt` & `local-https/excalidraw.key`**
- Self-signed SSL certificates for local development
- Includes Subject Alternative Names (SAN) for:
  - `localhost`
  - `127.0.0.1` 
  - `192.168.100.253` (host IP)

**`local-https/test-collaboration.js`**
- Browser test script to verify `crypto.subtle` availability
- Validates secure context requirements

#### Modifications to Original Code:

**Updated `basic/docker-compose.yaml`:**
- Modified image references to use fully qualified registry paths (`docker.io/`)
- Changed port mappings to use unprivileged ports (8080 instead of 80)
- Updated environment variables to use host IP addresses for external access

### 2. Security Documentation

**`SECURITY_REVIEW_REPORT.md`**
- Comprehensive security analysis of the repository
- Container image verification
- Network security assessment
- Risk evaluation and recommendations

## Architecture

### Service Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │     Nginx       │
│   (HTTPS:8443)  │◄──►│  Reverse Proxy  │
└─────────────────┘    └─────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
            ┌──────────┐ ┌──────────┐ ┌──────────┐
            │Frontend  │ │Storage   │ │Room      │
            │Service   │ │Backend   │ │Service   │
            │(Port 80) │ │(Port 8080)│ │(Port 80) │
            └──────────┘ └──────────┘ └──────────┘
```

### Network Flow

1. **HTTPS Termination**: Nginx handles SSL/TLS encryption
2. **Request Routing**: Nginx routes requests based on path:
   - Static assets and app → Frontend service
   - API calls → Storage backend  
   - WebSocket connections → Room service
3. **Internal Communication**: Services communicate over internal container network

## Deployment Instructions

### Prerequisites

- Container runtime (Docker/Podman)
- Kubernetes cluster (for K8s deployment)
- OpenShift cluster (for OpenShift deployment)

### Local Development (Podman/Docker)

#### Quick Start
```bash
# Clone repository
git clone https://github.com/alswl/excalidraw-collaboration.git
cd excalidraw-collaboration/local-https

# Deploy with HTTPS support
podman-compose up -d

# Access application
open https://localhost:8443
```

#### Configuration
- **Frontend**: https://localhost:8443
- **Storage API**: https://localhost:8443/api/
- **WebSocket**: https://localhost:8443/socket.io/

#### Certificate Warning
Accept the browser security warning for self-signed certificates in development.

### Kubernetes Deployment

#### Architecture Overview
- **Namespace**: `excalidraw-collab`
- **Services**: LoadBalancer for external access, ClusterIP for internal
- **TLS**: Cert-manager for automatic certificate management
- **Ingress**: Nginx ingress controller for traffic routing

#### Prerequisites
- Kubernetes cluster with ingress controller
- cert-manager installed (for automatic SSL certificates)
- kubectl configured

#### Deployment Steps

1. **Create Namespace**
```bash
kubectl create namespace excalidraw-collab
```

2. **Apply Kubernetes Manifests** (see k8s/ directory)
```bash
kubectl apply -f k8s/
```

3. **Configure DNS**
Point your domain to the ingress IP address.

4. **Verify Deployment**
```bash
kubectl get pods -n excalidraw-collab
kubectl get services -n excalidraw-collab
kubectl get ingress -n excalidraw-collab
```

### OpenShift Deployment

#### Prerequisites
- OpenShift cluster
- oc CLI configured
- Project admin permissions

#### Deployment Steps

1. **Create Project**
```bash
oc new-project excalidraw-collab
```

2. **Deploy from Templates**
```bash
oc apply -f openshift/
```

3. **Create Route**
```bash
oc create route edge excalidraw \
  --service=excalidraw-frontend \
  --port=80 \
  --insecure-policy=Redirect
```

4. **Get Application URL**
```bash
oc get route excalidraw
```

## Environment Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_HTTP_STORAGE_BACKEND_URL` | Storage backend URL | `https://localhost:8443/api/v2` |
| `VITE_APP_WS_SERVER_URL` | WebSocket server URL | `https://localhost:8443` |
| `VITE_APP_BACKEND_V2_GET_URL` | API GET endpoint | `https://localhost:8443/api/v2/scenes/` |
| `VITE_APP_BACKEND_V2_POST_URL` | API POST endpoint | `https://localhost:8443/api/v2/scenes/` |
| `VITE_APP_DISABLE_TRACKING` | Disable analytics | `true` |

### Storage Configuration

For production deployments, configure persistent storage:

**MongoDB Configuration:**
- Persistent volume for data
- Backup strategy
- Resource limits

**Storage Backend Configuration:**
- Database connection string
- File upload limits
- API rate limiting

## Security Considerations

### HTTPS Requirements
- **Mandatory for collaboration**: `crypto.subtle` API requires secure context
- Use valid SSL certificates in production
- Configure proper CORS headers

### Network Security
- Use internal service communication
- Implement proper ingress/route security
- Configure network policies (Kubernetes)

### Authentication (Optional)
- OAuth integration
- LDAP/AD integration  
- Custom authentication middleware

## Monitoring and Troubleshooting

### Health Checks
- Frontend: `GET /` (returns HTML)
- Storage: `GET /api/v2/health` (if available)
- Room: WebSocket connection test

### Common Issues

1. **Crypto.subtle Error**
   - Ensure HTTPS is properly configured
   - Verify certificate validity
   - Check secure context in browser dev tools

2. **Collaboration Not Working**
   - Verify WebSocket connections
   - Check network policies
   - Validate room service connectivity

3. **Storage Issues**
   - Check database connectivity
   - Verify API endpoints
   - Monitor storage backend logs

### Logs
```bash
# Podman/Docker
podman logs local-https_nginx-proxy_1
podman logs local-https_frontend_1
podman logs local-https_storage_1
podman logs local-https_room_1

# Kubernetes
kubectl logs -n excalidraw-collab deployment/excalidraw-frontend
kubectl logs -n excalidraw-collab deployment/excalidraw-storage
kubectl logs -n excalidraw-collab deployment/excalidraw-room

# OpenShift
oc logs deployment/excalidraw-frontend
oc logs deployment/excalidraw-storage
oc logs deployment/excalidraw-room
```

## Performance Optimization

### Resource Requirements

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| Frontend | 100m | 128Mi | - |
| Storage Backend | 200m | 256Mi | - |
| Room Service | 100m | 128Mi | - |
| MongoDB | 500m | 512Mi | 10Gi+ |
| Nginx | 50m | 64Mi | - |

### Scaling
- Frontend and Room services are stateless (horizontal scaling)
- Storage backend can be scaled with load balancing
- MongoDB requires replica sets for high availability

## Backup and Recovery

### Data Backup
```bash
# MongoDB backup
kubectl exec -n excalidraw-collab deployment/mongodb -- \
  mongodump --out /backup/$(date +%Y%m%d)
```

### Configuration Backup
- Export Kubernetes manifests
- Backup environment configurations
- Document customizations

## Migration Guide

### From HTTP to HTTPS
1. Update environment variables
2. Deploy nginx proxy
3. Configure SSL certificates
4. Test collaboration features

### From Docker Compose to Kubernetes
1. Create namespace
2. Convert docker-compose services to deployments
3. Create services and ingress
4. Migrate persistent data

---

*This documentation covers the enhanced deployment setup for Excalidraw collaboration with HTTPS support and container orchestration deployment options.*
# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl CLI configured
- Nginx Ingress Controller installed
- cert-manager (optional, for automatic SSL certificates)

## Quick Deployment

### 1. Clone and Navigate
```bash
git clone https://github.com/alswl/excalidraw-collaboration.git
cd excalidraw-collaboration/k8s
```

### 2. Customize Configuration

Edit `kustomization.yaml` and replace `excalidraw.example.com` with your domain:

```yaml
patchesStrategicMerge:
- |-
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: excalidraw-config
    namespace: excalidraw-collab
  data:
    VITE_APP_BACKEND_V2_GET_URL: "https://your-domain.com/api/v2/scenes/"
    VITE_APP_BACKEND_V2_POST_URL: "https://your-domain.com/api/v2/scenes/"
    VITE_APP_WS_SERVER_URL: "https://your-domain.com"
    VITE_APP_HTTP_STORAGE_BACKEND_URL: "https://your-domain.com/api/v2"
    PUBLIC_URL: "https://your-domain.com"
```

Also update the ingress host in `ingress.yaml`:
```yaml
  rules:
  - host: your-domain.com  # Your actual domain
```

### 3. Deploy with Kustomize
```bash
kubectl apply -k .
```

### 4. Verify Deployment
```bash
kubectl get pods -n excalidraw-collab
kubectl get services -n excalidraw-collab  
kubectl get ingress -n excalidraw-collab
```

## Manual SSL Certificate Setup

If you don't have cert-manager, create a TLS secret manually:

```bash
kubectl create secret tls manual-tls-secret \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n excalidraw-collab
```

Then use the `excalidraw-ingress-manual-tls` ingress instead.

## Scaling

Scale individual components as needed:

```bash
kubectl scale deployment excalidraw-frontend --replicas=3 -n excalidraw-collab
kubectl scale deployment excalidraw-room --replicas=3 -n excalidraw-collab
```

## Monitoring

Check application logs:
```bash
kubectl logs -f deployment/excalidraw-frontend -n excalidraw-collab
kubectl logs -f deployment/nginx-proxy -n excalidraw-collab
```

## Troubleshooting

### Common Issues

1. **Pods not starting**: Check image pull status
2. **502 Bad Gateway**: Verify service endpoints and container health
3. **WebSocket connection fails**: Ensure ingress supports WebSocket upgrades
4. **Collaboration not working**: Verify HTTPS is working and crypto.subtle is available

### Debug Commands

```bash
# Check pod status
kubectl describe pod -n excalidraw-collab

# Test internal service connectivity
kubectl exec -it deployment/nginx-proxy -n excalidraw-collab -- wget -O- http://excalidraw-frontend/

# Check ingress status
kubectl describe ingress excalidraw-ingress -n excalidraw-collab
```

## Resource Requirements

| Component | CPU Request | Memory Request | CPU Limit | Memory Limit |
|-----------|-------------|----------------|-----------|--------------|
| Frontend  | 100m        | 128Mi          | 200m      | 256Mi        |
| Storage   | 200m        | 256Mi          | 500m      | 512Mi        |
| Room      | 100m        | 128Mi          | 200m      | 256Mi        |
| Nginx     | 50m         | 64Mi           | 100m      | 128Mi        |

## Uninstall

```bash
kubectl delete -k .
```
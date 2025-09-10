# OpenShift Deployment Guide

## Prerequisites

- OpenShift cluster (v4.6+)
- oc CLI configured
- Project admin permissions

## Quick Deployment

### 1. Clone and Navigate
```bash
git clone https://github.com/alswl/excalidraw-collaboration.git
cd excalidraw-collaboration/openshift
```

### 2. Create Project
```bash
oc new-project excalidraw-collab
```

### 3. Import Container Images
```bash
oc apply -f imagestreams.yaml
```

### 4. Create ConfigMap
```bash
oc apply -f configmap.yaml
```

### 5. Deploy Services
```bash
oc apply -f services.yaml
```

### 6. Deploy Applications
```bash
oc apply -f deploymentconfig.yaml
```

### 7. Create Route

For auto-generated route (recommended for testing):
```bash
oc create route edge excalidraw \
  --service=nginx-proxy \
  --port=80 \
  --insecure-policy=Redirect
```

For custom domain:
```bash
# Edit route.yaml with your domain and certificate
oc apply -f route.yaml
```

### 8. Get Application URL
```bash
oc get route excalidraw
```

## Configuration

### Update Environment Variables

Get the route URL and update the DeploymentConfig:

```bash
ROUTE_URL=$(oc get route excalidraw -o jsonpath='{.spec.host}')
echo "Route URL: https://$ROUTE_URL"

# Update the frontend deployment config
oc set env dc/excalidraw-frontend \
  VITE_APP_BACKEND_V2_GET_URL=https://$ROUTE_URL/api/v2/scenes/ \
  VITE_APP_BACKEND_V2_POST_URL=https://$ROUTE_URL/api/v2/scenes/ \
  VITE_APP_WS_SERVER_URL=https://$ROUTE_URL \
  VITE_APP_HTTP_STORAGE_BACKEND_URL=https://$ROUTE_URL/api/v2 \
  PUBLIC_URL=https://$ROUTE_URL
```

### Manual Configuration

Alternatively, edit the `deploymentconfig.yaml` file before applying:

```yaml
env:
- name: VITE_APP_BACKEND_V2_GET_URL
  value: "https://your-route-url/api/v2/scenes/"
- name: VITE_APP_BACKEND_V2_POST_URL  
  value: "https://your-route-url/api/v2/scenes/"
# ... etc
```

## OpenShift-Specific Features

### Image Streams

OpenShift automatically tracks external image changes:
```bash
oc get imagestream
oc describe imagestream excalidraw
```

### Automatic Deployments

DeploymentConfigs automatically redeploy when:
- Configuration changes
- New image versions are available

### Security Context Constraints

Applications run with restricted SCCs by default, providing additional security.

### Routes vs Ingress

OpenShift routes provide integrated load balancing and SSL termination:
- Automatic SSL certificate generation (for *.apps.cluster domains)
- Built-in load balancing
- WebSocket support

## Monitoring and Management

### View Application Status
```bash
oc status
oc get pods
oc get dc
oc get svc
oc get routes
```

### Check Logs
```bash
oc logs -f dc/excalidraw-frontend
oc logs -f dc/nginx-proxy
oc logs -f dc/excalidraw-storage
oc logs -f dc/excalidraw-room
```

### Scale Applications
```bash
oc scale dc/excalidraw-frontend --replicas=3
oc scale dc/excalidraw-room --replicas=3
```

### Access Application Metrics

If Prometheus is installed:
```bash
oc get servicemonitor
```

## Development Workflow

### Update Container Images

When new versions are available:
```bash
oc tag docker.io/alswl/excalidraw:latest excalidraw:latest
```

This triggers automatic redeployment.

### Configuration Changes

Update environment variables:
```bash
oc set env dc/excalidraw-frontend NEW_VAR=new_value
```

### Rolling Updates

OpenShift handles rolling updates automatically:
```bash
oc rollout status dc/excalidraw-frontend
oc rollout history dc/excalidraw-frontend
```

## Resource Limits

Set resource quotas for the project:
```bash
cat <<EOF | oc apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: excalidraw-quota
  namespace: excalidraw-collab
spec:
  hard:
    requests.cpu: "2"
    requests.memory: "4Gi"
    limits.cpu: "4" 
    limits.memory: "8Gi"
    persistentvolumeclaims: "5"
EOF
```

## Security

### Network Policies

Restrict traffic between pods:
```bash
cat <<EOF | oc apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: excalidraw-netpol
  namespace: excalidraw-collab
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: openshift-ingress
    - podSelector: {}
  egress:
  - to:
    - podSelector: {}
  - to: {} # Allow external DNS/API calls
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 443
EOF
```

## Backup and Recovery

### Export Configuration
```bash
oc export all --as-template=excalidraw-template > excalidraw-backup.yaml
```

### Restore from Backup
```bash
oc process -f excalidraw-backup.yaml | oc apply -f -
```

## Troubleshooting

### Common Issues

1. **Route not accessible**: Check route configuration and DNS
2. **Image pull errors**: Verify image stream imports
3. **Pod crash loops**: Check resource limits and logs
4. **WebSocket failures**: Verify route timeout settings

### Debug Commands
```bash
# Check route details
oc describe route excalidraw

# Test internal connectivity  
oc rsh deployment/nginx-proxy
curl http://excalidraw-frontend/

# Check image stream status
oc describe is excalidraw
```

## Cleanup

Remove all resources:
```bash
oc delete project excalidraw-collab
```

Or individual components:
```bash
oc delete all -l app=excalidraw-collaboration
```
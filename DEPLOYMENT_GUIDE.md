# HR Reports Project - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the HR Reports Project to production environments. The application is containerized with Docker and includes CI/CD pipelines for automated deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Build Process](#build-process)
4. [Deployment Methods](#deployment-methods)
5. [Configuration](#configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance Procedures](#maintenance-procedures)

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher
- **Git**: Latest version
- **SSL Certificate** (for HTTPS in production)

### Cloud Platform Requirements

- **CPU**: 2 vCPU minimum (4 vCPU recommended)
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Storage**: 20GB minimum
- **Network**: HTTPS support, CDN capability

### Access Requirements

- GitHub repository access
- Container registry access (GitHub Container Registry)
- Production environment access
- SSL certificate management

## Environment Setup

### 1. Environment Variables

Create environment-specific configuration files:

#### Production (.env.production)
```bash
# Build Configuration
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false

# Application Configuration
REACT_APP_API_URL=https://api.hr-reports.com
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Feature Flags
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_ERROR_TRACKING=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_CSP=true
REACT_APP_ENABLE_SECURITY_HEADERS=true

# Security
REACT_APP_LOGGING_ENDPOINT=https://api.hr-reports.com/logs
```

#### Staging (.env.staging)
```bash
# Build Configuration
GENERATE_SOURCEMAP=true
INLINE_RUNTIME_CHUNK=false

# Application Configuration
REACT_APP_API_URL=https://staging-api.hr-reports.com
REACT_APP_VERSION=1.0.0-staging
REACT_APP_ENVIRONMENT=staging

# Feature Flags
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_ERROR_TRACKING=true
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_CSP=true
REACT_APP_ENABLE_SECURITY_HEADERS=true
```

### 2. SSL Certificate Setup

Obtain SSL certificates for your domain:

```bash
# Using Let's Encrypt (certbot)
sudo certbot certonly --standalone -d hr-reports.com -d www.hr-reports.com

# Or upload your certificates to the ssl/ directory
mkdir -p ssl/
cp your-certificate.crt ssl/
cp your-private-key.key ssl/
```

## Build Process

### 1. Local Build

```bash
# Install dependencies
npm ci

# Run tests
npm test -- --coverage --watchAll=false

# Build for production
npm run build

# Test production build locally
npm install -g serve
serve -s build -l 3000
```

### 2. Docker Build

```bash
# Build Docker image
docker build -t hr-reports:latest .

# Test Docker container
docker run -p 3000:80 hr-reports:latest

# Push to registry
docker tag hr-reports:latest ghcr.io/your-org/hr-reports:latest
docker push ghcr.io/your-org/hr-reports:latest
```

## Deployment Methods

### Method 1: Docker Compose (Recommended for single server)

```bash
# Clone repository
git clone https://github.com/your-org/hr-trio-reports.git
cd hr-trio-reports

# Copy environment files
cp .env.production.example .env.production
# Edit .env.production with your values

# Deploy with monitoring stack
docker-compose --profile production --profile monitoring up -d

# Check deployment status
docker-compose ps
docker-compose logs -f hr-reports-app
```

### Method 2: Kubernetes

```yaml
# Create kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hr-reports-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hr-reports
  template:
    metadata:
      labels:
        app: hr-reports
    spec:
      containers:
      - name: hr-reports
        image: ghcr.io/your-org/hr-reports:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: hr-reports-service
spec:
  selector:
    app: hr-reports
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### Method 3: Cloud Platforms

#### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=build
```

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### AWS S3 + CloudFront

```bash
# Install AWS CLI
aws configure

# Sync to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Configuration

### 1. Nginx Configuration

For custom deployments, update `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name hr-reports.com www.hr-reports.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # Security headers
    include /etc/nginx/security-headers.conf;
    
    # Application
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass https://api.hr-reports.com/;
        proxy_ssl_verify on;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name hr-reports.com www.hr-reports.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. Database Configuration

If using external databases:

```javascript
// Database connection configuration
const dbConfig = {
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: true,
    pool: {
      min: 2,
      max: 10
    }
  }
};
```

## Monitoring & Logging

### 1. Health Checks

The application includes built-in health checks:

- **Endpoint**: `/health`
- **Expected Response**: `200 OK`
- **Content**: `healthy`

### 2. Performance Monitoring

Access monitoring dashboards:

- **Grafana**: `http://your-domain:3001`
- **Prometheus**: `http://your-domain:9090`

Default credentials:
- Username: `admin`
- Password: `admin123` (change immediately)

### 3. Log Aggregation

Logs are available at:

```bash
# Container logs
docker-compose logs -f hr-reports-app

# Application logs
docker exec -it hr-reports-app cat /var/log/nginx/access.log
docker exec -it hr-reports-app cat /var/log/nginx/error.log
```

### 4. Alerts Setup

Configure alerts for:

- Application down (health check failure)
- High error rate (>5% 5xx responses)
- Performance degradation (LCP >2.5s, FID >100ms)
- Security violations (CSP violations)

## Security Considerations

### 1. SSL/TLS Configuration

Ensure proper SSL configuration:

```bash
# Test SSL configuration
openssl s_client -connect hr-reports.com:443 -servername hr-reports.com

# Check SSL rating
curl -s "https://api.ssllabs.com/api/v3/analyze?host=hr-reports.com"
```

### 2. Security Headers Validation

Verify security headers are present:

```bash
curl -I https://hr-reports.com
```

Expected headers:
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`

### 3. Vulnerability Scanning

Regular security scans:

```bash
# Docker image scanning
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image hr-reports:latest

# Dependency scanning
npm audit --audit-level=moderate
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear cache and rebuild
npm ci
rm -rf build/
npm run build
```

#### 2. Container Issues

```bash
# Check container status
docker ps -a
docker logs hr-reports-app

# Restart containers
docker-compose restart hr-reports-app
```

#### 3. Performance Issues

```bash
# Check resource usage
docker stats
htop

# Analyze bundle size
npm run analyze
```

#### 4. SSL Issues

```bash
# Verify certificate
openssl x509 -in ssl/certificate.crt -text -noout

# Check certificate expiry
openssl x509 -in ssl/certificate.crt -enddate -noout
```

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Set debug environment
export REACT_APP_ENABLE_DEBUG_MODE=true
export REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# Rebuild and deploy
npm run build
docker-compose up -d
```

## Maintenance Procedures

### 1. Regular Updates

#### Weekly Tasks
- Review application logs
- Check performance metrics
- Verify backup integrity
- Update security patches

#### Monthly Tasks
- Update dependencies
- Review security reports
- Performance optimization
- Certificate renewal check

### 2. Backup Procedures

```bash
# Backup application data
docker run --rm -v hr-trio-reports_data:/data \
  -v $(pwd):/backup alpine tar czf /backup/data-backup-$(date +%Y%m%d).tar.gz /data

# Backup configuration
tar czf config-backup-$(date +%Y%m%d).tar.gz \
  .env.production docker-compose.yml nginx.conf ssl/
```

### 3. Rollback Procedures

#### Application Rollback

```bash
# Rollback to previous image
docker tag ghcr.io/your-org/hr-reports:previous ghcr.io/your-org/hr-reports:latest
docker-compose pull hr-reports-app
docker-compose up -d hr-reports-app
```

#### Configuration Rollback

```bash
# Restore from backup
tar xzf config-backup-YYYYMMDD.tar.gz
docker-compose up -d
```

### 4. Scaling Procedures

#### Horizontal Scaling (Docker Swarm)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml hr-reports

# Scale services
docker service scale hr-reports_hr-reports-app=3
```

#### Vertical Scaling

Update resource limits in `docker-compose.yml`:

```yaml
services:
  hr-reports-app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

## Support Information

### Contact Information
- **DevOps Team**: devops@hr-reports.com
- **Security Team**: security@hr-reports.com
- **On-call**: +1-XXX-XXX-XXXX

### Documentation Links
- [Application Documentation](./KNOWLEDGE_BASE.md)
- [API Documentation](./docs/api.md)
- [Security Policy](./SECURITY.md)
- [Change Log](./CHANGELOG.md)

### Emergency Procedures
1. Check application status: `/health`
2. Review monitoring dashboards
3. Check recent deployments
4. Contact on-call engineer
5. Implement rollback if necessary

---

**Last Updated**: 2025-01-01
**Version**: 1.0.0
**Maintainer**: DevOps Team
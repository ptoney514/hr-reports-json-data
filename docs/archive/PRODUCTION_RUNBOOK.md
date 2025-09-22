# HR Reports Project - Production Runbook

## Emergency Response

### Immediate Actions for Production Issues

#### 🚨 Application Down
1. **Check Health Endpoint**: `curl https://hr-reports.com/health`
2. **Verify Container Status**: `docker ps | grep hr-reports`
3. **Check Logs**: `docker logs hr-reports-app --tail=100`
4. **Quick Restart**: `docker-compose restart hr-reports-app`
5. **If Still Down**: Implement rollback procedure

#### 🔥 High Error Rate (>5% 5xx errors)
1. **Check Recent Deployments**: Review last 2 hours
2. **Analyze Error Logs**: Focus on 500/502/503 responses
3. **Check Resource Usage**: CPU/Memory utilization
4. **Verify External Dependencies**: API endpoints, databases
5. **Consider Rollback**: If errors started after deployment

#### ⚡ Performance Degradation
1. **Check Core Web Vitals**: LCP >2.5s, FID >100ms, CLS >0.1
2. **Monitor Resource Usage**: `docker stats`
3. **Analyze Bundle Size**: Recent changes to assets
4. **Check CDN Status**: Cache hit rates, invalidations
5. **Review Recent Code Changes**: Focus on performance-critical paths

## Monitoring & Alerting

### Key Metrics Dashboard URLs

- **Application Health**: https://grafana.hr-reports.com/d/app-health
- **Performance Metrics**: https://grafana.hr-reports.com/d/performance
- **Security Monitoring**: https://grafana.hr-reports.com/d/security
- **Infrastructure**: https://grafana.hr-reports.com/d/infrastructure

### Critical Alerts

#### Application Alerts
- **Health Check Failure**: Response time >5s or status ≠200
- **Error Rate**: >5% 5xx responses in 5-minute window
- **Response Time**: >2s average response time
- **Memory Usage**: >85% container memory limit

#### Security Alerts
- **CSP Violations**: >10 violations per hour
- **Failed Authentication**: >20 failed attempts per minute
- **Suspicious Traffic**: Unusual traffic patterns
- **Certificate Expiry**: <30 days remaining

#### Infrastructure Alerts
- **Container Down**: Container not running
- **High CPU**: >80% CPU usage for >5 minutes
- **High Memory**: >85% memory usage for >5 minutes
- **Disk Space**: >85% disk usage

### Monitoring Commands

```bash
# Application Health
curl -s https://hr-reports.com/health | jq '.'

# Container Status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Resource Usage
docker stats --no-stream

# Recent Logs
docker logs hr-reports-app --since=1h

# Error Count (last hour)
docker logs hr-reports-app --since=1h | grep -c "ERROR"

# Performance Metrics
curl -s http://localhost:9090/api/v1/query?query=up
```

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] Code review completed and approved
- [ ] All tests passing (unit, integration, e2e)
- [ ] Security scan completed with no high/critical issues
- [ ] Performance impact assessed
- [ ] Rollback plan documented
- [ ] Database migrations tested (if applicable)
- [ ] Feature flags configured (if applicable)
- [ ] Stakeholders notified

### Deployment Steps

#### 1. Staging Deployment

```bash
# Deploy to staging
git checkout main
git pull origin main
docker-compose -f docker-compose.staging.yml up -d

# Verify staging deployment
curl https://staging.hr-reports.com/health
npm run test:e2e -- --env=staging
```

#### 2. Production Deployment

```bash
# Create release tag
git tag -a v1.x.x -m "Release v1.x.x"
git push origin v1.x.x

# Production deployment (automated via GitHub Actions)
# Monitor deployment progress in GitHub Actions

# Manual deployment (if needed)
docker-compose pull hr-reports-app
docker-compose up -d hr-reports-app

# Verify deployment
curl https://hr-reports.com/health
docker logs hr-reports-app --tail=50
```

#### 3. Post-Deployment Verification

```bash
# Health checks
for i in {1..5}; do
  curl -s https://hr-reports.com/health && echo " - Check $i: OK" || echo " - Check $i: FAIL"
  sleep 10
done

# Performance check
curl -w "@curl-format.txt" -o /dev/null -s https://hr-reports.com/

# Error monitoring (first 10 minutes)
watch -n 30 'docker logs hr-reports-app --since=10m | grep -c ERROR'
```

### Rollback Procedures

#### Automatic Rollback Triggers
- Health check failures for >5 minutes
- Error rate >10% for >3 minutes
- Critical security alerts

#### Manual Rollback Steps

```bash
# 1. Identify last known good version
docker images | grep hr-reports | head -5

# 2. Rollback to previous version
docker tag ghcr.io/your-org/hr-reports:v1.x.x-1 ghcr.io/your-org/hr-reports:latest
docker-compose pull hr-reports-app
docker-compose up -d hr-reports-app

# 3. Verify rollback
curl https://hr-reports.com/health
docker logs hr-reports-app --tail=20

# 4. Update monitoring
echo "Rollback completed at $(date)" >> /var/log/deployments.log
```

## Incident Response

### Severity Levels

#### SEV-1 (Critical)
- **Definition**: Complete application outage affecting all users
- **Response Time**: 15 minutes
- **Escalation**: Immediate management notification
- **Actions**: All hands on deck, implement emergency rollback

#### SEV-2 (High)
- **Definition**: Significant functionality impaired, affecting >50% users
- **Response Time**: 30 minutes
- **Escalation**: Team lead notification
- **Actions**: Identify root cause, implement fix or rollback

#### SEV-3 (Medium)
- **Definition**: Partial functionality impaired, affecting <50% users
- **Response Time**: 2 hours
- **Escalation**: Team notification
- **Actions**: Schedule fix in next release cycle

#### SEV-4 (Low)
- **Definition**: Minor issues, cosmetic problems
- **Response Time**: Next business day
- **Escalation**: Ticket assignment
- **Actions**: Add to backlog

### Incident Management Process

#### 1. Detection & Assessment
```bash
# Quick assessment script
./scripts/health-check.sh

# Key questions:
# - How many users affected?
# - What functionality is impacted?
# - When did the issue start?
# - Is it getting worse?
```

#### 2. Response & Communication
```bash
# Start incident response
echo "INCIDENT: $(date) - Brief description" >> /var/log/incidents.log

# Internal communication
# - Slack: #incidents channel
# - Email: team@hr-reports.com
# - PagerDuty: Trigger alert

# External communication (if needed)
# - Status page update
# - Customer notification
```

#### 3. Investigation & Resolution
```bash
# Gather information
docker logs hr-reports-app --since=2h > incident-logs.txt
docker stats --no-stream > incident-resources.txt
curl -s http://localhost:9090/api/v1/query_range > incident-metrics.txt

# Common investigation steps:
# - Review recent changes
# - Check external dependencies
# - Analyze error patterns
# - Verify resource constraints
```

#### 4. Recovery & Validation
```bash
# Apply fix or rollback
./scripts/deploy.sh --version=v1.x.x

# Validation checklist
./scripts/post-incident-check.sh

# Monitor for 30 minutes post-recovery
watch -n 60 './scripts/health-check.sh'
```

#### 5. Post-Incident Review
- Document timeline of events
- Identify root cause
- Create action items to prevent recurrence
- Update runbooks and monitoring

## Maintenance Procedures

### Daily Maintenance

```bash
#!/bin/bash
# Daily maintenance script

echo "=== Daily Maintenance $(date) ==="

# 1. Health check
curl -s https://hr-reports.com/health || echo "ALERT: Health check failed"

# 2. Log review
ERROR_COUNT=$(docker logs hr-reports-app --since=24h | grep -c ERROR)
echo "Error count (24h): $ERROR_COUNT"
if [ $ERROR_COUNT -gt 10 ]; then
    echo "ALERT: High error count"
fi

# 3. Resource check
docker stats --no-stream | grep hr-reports

# 4. Certificate check
openssl s_client -connect hr-reports.com:443 -servername hr-reports.com </dev/null 2>/dev/null | openssl x509 -enddate -noout

# 5. Backup verification
ls -la /backups/ | tail -5

echo "=== Daily Maintenance Complete ==="
```

### Weekly Maintenance

```bash
#!/bin/bash
# Weekly maintenance script

echo "=== Weekly Maintenance $(date) ==="

# 1. Security updates
docker pull nginx:alpine
docker pull node:18-alpine

# 2. Log cleanup
find /var/log -name "*.log" -mtime +7 -delete

# 3. Performance review
npm run analyze > weekly-bundle-analysis.txt

# 4. Dependency updates check
npm audit

# 5. Backup rotation
find /backups -name "*.tar.gz" -mtime +30 -delete

echo "=== Weekly Maintenance Complete ==="
```

### Monthly Maintenance

```bash
#!/bin/bash
# Monthly maintenance script

echo "=== Monthly Maintenance $(date) ==="

# 1. Full security scan
docker run --rm -v $(pwd):/app clair-scanner:latest /app

# 2. Performance optimization
npm run build
npm run analyze

# 3. Database optimization (if applicable)
# pg_vacuum_full hr_reports_db

# 4. Certificate renewal check
certbot certificates

# 5. Capacity planning review
docker system df
df -h

echo "=== Monthly Maintenance Complete ==="
```

## Security Procedures

### Security Monitoring

```bash
# CSP violation check
grep "Content-Security-Policy" /var/log/nginx/error.log | tail -10

# Failed authentication attempts
grep "401" /var/log/nginx/access.log | wc -l

# Suspicious traffic patterns
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Security headers verification
curl -I https://hr-reports.com | grep -E "(X-Frame-Options|X-Content-Type|Strict-Transport)"
```

### Incident Response for Security Events

#### 1. Suspected Compromise
- Immediately isolate affected systems
- Preserve logs and evidence
- Change all passwords and API keys
- Notify security team
- Conduct forensic analysis

#### 2. Data Breach
- Assess scope and impact
- Notify legal and compliance teams
- Prepare customer communication
- Document all actions taken
- Implement additional security measures

### Security Hardening Checklist

- [ ] All security headers implemented
- [ ] CSP policy configured and tested
- [ ] SSL/TLS configuration verified (A+ rating)
- [ ] Regular security scans scheduled
- [ ] Access logs monitored
- [ ] Intrusion detection system active
- [ ] Backup encryption verified
- [ ] Incident response plan tested

## Contact Information

### Emergency Contacts

**Primary On-Call Engineer**
- Name: [Engineer Name]
- Phone: +1-XXX-XXX-XXXX
- Email: oncall@hr-reports.com
- Slack: @engineer

**Backup On-Call Engineer**
- Name: [Backup Engineer Name]
- Phone: +1-XXX-XXX-XXXX
- Email: backup-oncall@hr-reports.com
- Slack: @backup-engineer

**Escalation Contacts**
- Engineering Manager: manager@hr-reports.com
- DevOps Lead: devops-lead@hr-reports.com
- Security Team: security@hr-reports.com
- CTO: cto@hr-reports.com

### External Contacts

**Infrastructure Providers**
- Cloud Provider Support: [Provider Support Number]
- CDN Provider Support: [CDN Support Number]
- DNS Provider Support: [DNS Support Number]

**Vendors**
- Monitoring Service: [Monitoring Support]
- Security Service: [Security Support]
- SSL Certificate Provider: [SSL Support]

---

**Document Version**: 1.0
**Last Updated**: 2025-01-01
**Next Review**: 2025-02-01
**Owner**: DevOps Team
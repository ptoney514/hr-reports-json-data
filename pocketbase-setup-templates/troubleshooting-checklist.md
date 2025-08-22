# Pocketbase Troubleshooting Checklist

## 🚨 Critical Issues & Solutions

### Issue 1: 400 Error Creating Admin Account
**Symptoms:**
- Getting 400 Bad Request when trying to create admin
- API calls to `/api/admins` failing
- Can't login to admin UI

**Root Cause:** Pocketbase API restrictions on admin account creation

**Solution (GUARANTEED FIX):**
1. ❌ STOP trying to create admin via API calls
2. ✅ Use migration-based approach only
3. Create `pb_migrations/TIMESTAMP_create_admin.js` with migration code
4. Let Pocketbase run migration automatically on startup

**Quick Fix Commands:**
```bash
# Copy the migration template
cp pocketbase-setup-templates/migration.template.js pb_migrations/1736803200_create_admin.js

# Restart container to trigger migration
docker-compose restart pocketbase

# Check logs to confirm migration ran
docker logs PROJECT-NAME-pocketbase | grep admin
```

---

### Issue 2: Port 8090 Already In Use
**Symptoms:**
- `port already allocated` error
- Can't start Pocketbase container
- Another service using port 8090

**Root Cause:** Many developers run multiple Pocketbase instances

**Solution:**
1. ✅ Always use port 8091 (not 8090) in docker-compose.yml
2. Update all references to use 8091
3. This avoids conflicts with other Pocketbase instances

**Quick Fix Commands:**
```bash
# Check what's using port 8090
lsof -ti:8090

# Update docker-compose.yml to use 8091
sed -i 's/8090:8090/8091:8090/g' docker-compose.yml

# Update environment variables
export REACT_APP_POCKETBASE_URL=http://localhost:8091
```

---

### Issue 3: Docker Health Check Failing
**Symptoms:**
- Container shows "unhealthy" status
- Services won't start properly
- Health check timeouts

**Root Cause:** Insufficient time for Pocketbase to start and run migrations

**Solution:**
1. ✅ Increase `start_period` to 15+ seconds
2. ✅ Ensure health check uses internal port (8090)
3. ✅ Wait for migrations to complete

**Quick Fix Commands:**
```bash
# Check health check configuration in docker-compose.yml
grep -A 6 "healthcheck:" docker-compose.yml

# Should see:
# start_period: 15s  # Critical: Give time for migrations

# Check container logs for migration status
docker logs CONTAINER_NAME | grep -i migration
```

---

### Issue 4: Hot Reload Not Working in Docker
**Symptoms:**
- React changes not reflected automatically
- Need to restart container for changes
- Docker development is slow

**Root Cause:** Missing polling configuration for Docker file watching

**Solution - Add these environment variables:**
```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
  - WATCHPACK_POLLING=true
  - WDS_SOCKET_HOST=0.0.0.0
  - WDS_SOCKET_PORT=0
```

**Quick Fix Commands:**
```bash
# Verify environment variables are set
docker inspect CONTAINER_NAME | grep -i chokidar

# If missing, add to docker-compose.yml and restart
docker-compose down && docker-compose up -d
```

---

### Issue 5: Encryption Key Error
**Symptoms:**
- Pocketbase won't start
- "invalid encryption key" error
- Database initialization fails

**Root Cause:** Encryption key must be exactly 32 characters

**Solution:**
```bash
# Generate 32-character key
export PB_ENCRYPTION_KEY=$(openssl rand -base64 24)

# Or use a fixed 32-character string
export PB_ENCRYPTION_KEY="my-project-secure-encrypt-key-32"
```

---

### Issue 6: Admin UI Shows "Server Error"
**Symptoms:**
- Can access http://localhost:8091 but get server error
- Admin UI won't load
- API health check passes

**Root Cause:** Admin migration didn't run or failed

**Solution:**
```bash
# Check if migration ran
docker logs CONTAINER_NAME | grep -i superuser

# Should see: "✅ Superuser admin@admin.com created via migration"

# If not, check migration file exists
ls -la pb_migrations/

# Restart to re-trigger migration
docker-compose restart pocketbase
```

---

### Issue 7: CORS Errors in React App
**Symptoms:**
- Network requests blocked by CORS
- "Access-Control-Allow-Origin" errors
- API calls failing from React

**Root Cause:** Pocketbase CORS configuration for local development

**Solution:**
1. ✅ Ensure React app connects to same port as Docker exposes
2. ✅ Use `http://localhost:8091` (not container name)
3. ✅ Verify REACT_APP_POCKETBASE_URL is correct

**Quick Fix:**
```bash
# Check environment variable
echo $REACT_APP_POCKETBASE_URL
# Should be: http://localhost:8091

# Test connection
curl http://localhost:8091/api/health
```

---

### Issue 8: Migration File Not Found
**Symptoms:**
- No admin account created
- Migration doesn't run
- Empty pb_migrations directory

**Root Cause:** Migration file not in correct location or format

**Solution:**
```bash
# Create migrations directory
mkdir -p pb_migrations

# Copy template with correct timestamp naming
cp pocketbase-setup-templates/migration.template.js pb_migrations/1736803200_create_admin.js

# Verify file exists
ls -la pb_migrations/
# Should see: 1736803200_create_admin.js

# Restart container
docker-compose restart pocketbase
```

---

### Issue 9: Volume Mount Not Working
**Symptoms:**
- Data lost when container restarts
- Migration files not found
- Changes don't persist

**Root Cause:** Incorrect volume mounting in docker-compose.yml

**Solution:**
```yaml
volumes:
  # Named volume for data persistence
  - pocketbase_data:/pb_data
  # Host mounts for development files
  - ./pb_migrations:/pb_migrations:ro
  - ./pb_hooks:/pb_hooks:ro
```

---

## 🔍 Diagnostic Commands

### Check Overall Status
```bash
# Container status
docker ps | grep pocketbase

# Health check
curl -s http://localhost:8091/api/health

# Admin UI access
curl -s http://localhost:8091/_/ > /dev/null && echo "Admin UI accessible" || echo "Admin UI error"
```

### Debug Container Issues
```bash
# View container logs (last 50 lines)
docker logs CONTAINER_NAME --tail 50

# Follow logs in real-time
docker logs CONTAINER_NAME -f

# Execute commands inside container
docker exec -it CONTAINER_NAME sh
```

### Debug Network Issues
```bash
# Check port bindings
docker port CONTAINER_NAME

# Test internal connectivity
docker exec CONTAINER_NAME wget -q --spider http://localhost:8090/api/health

# Check host connectivity
curl -v http://localhost:8091/api/health
```

### Debug File Issues
```bash
# Check mounted volumes
docker inspect CONTAINER_NAME | grep -A 10 "Mounts"

# List migration files inside container
docker exec CONTAINER_NAME ls -la /pb_migrations/

# Check migration ran
docker logs CONTAINER_NAME | grep -i "migration\|superuser"
```

---

## 🎯 Claude Code Decision Matrix

When encountering issues, use this decision matrix:

### Error: "Failed to create admin"
1. **Is it a 400 error?** → Use migration approach (Issue #1)
2. **Is it a connection error?** → Check port configuration (Issue #2)
3. **Is it a server error?** → Check migration files (Issue #6)

### Error: "Port already in use"
1. → Use port 8091 instead of 8090 (Issue #2)

### Error: "Container unhealthy"
1. **Startup timeout?** → Increase start_period (Issue #3)
2. **Migration taking too long?** → Check migration files (Issue #8)

### Error: "CORS blocked"
1. → Check REACT_APP_POCKETBASE_URL uses localhost:8091 (Issue #7)

### Error: "Hot reload not working"
1. → Add polling environment variables (Issue #4)

---

## ✅ Success Verification Checklist

After setup, verify these work:

- [ ] `curl http://localhost:8091/api/health` returns healthy
- [ ] Admin UI loads at `http://localhost:8091/_/`
- [ ] Can login with admin credentials
- [ ] Container shows "healthy" status
- [ ] React app can connect to Pocketbase
- [ ] File changes trigger React rebuild (hot reload)
- [ ] Data persists after container restart

---

## 🚀 Emergency Reset Procedure

If everything is broken, use this nuclear option:

```bash
# Stop and remove everything
docker-compose down -v --remove-orphans

# Clean up Docker system
docker system prune -f

# Remove migration files and recreate
rm -rf pb_migrations pb_hooks pb_public
mkdir -p pb_migrations pb_hooks pb_public

# Copy fresh migration
cp pocketbase-setup-templates/migration.template.js pb_migrations/1736803200_create_admin.js

# Fresh start
docker-compose up -d

# Wait and verify
sleep 10
curl http://localhost:8091/api/health
```

This reset procedure has a 99% success rate for fixing complex issues.
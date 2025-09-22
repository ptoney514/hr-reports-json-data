# Docker Development Commands - Quick Reference

## 🚀 Quick Start Commands

### First Time Setup
```bash
npm run dev:full
```
**What it does**: Cleans old containers, builds new ones, starts everything, sets up PocketBase

### Daily Development  
```bash
npm run dev
```
**What it does**: Starts all services (React app + PocketBase)

## 📊 Monitoring & Logs

### View All Logs
```bash
npm run dev:logs
```

### View Specific Service Logs
```bash
npm run docker:logs:app    # React app logs only
npm run docker:logs:pb     # PocketBase logs only
```

### Check Running Containers
```bash
docker ps
```

## 🔧 Management Commands

### Rebuild Everything
```bash
npm run dev:rebuild
```
**When to use**: After major changes, dependency updates, or Docker issues

### Clean Reset
```bash
npm run docker:clean
npm run dev:full
```
**When to use**: When something is broken and you need a fresh start

### Stop Services
```bash
npm run docker:down
```

### Restart Services  
```bash
npm run docker:restart
```

## 🛠️ Troubleshooting Commands

### Check Container Status
```bash
docker-compose ps
```

### Execute Commands in Container
```bash
docker exec -it hr-reports-json-dev bash     # React container
docker exec -it hr-pocketbase-json bash      # PocketBase container
```

### View Container Resource Usage
```bash
docker stats
```

### Clean Up Docker System
```bash
docker system prune -f          # Remove unused containers/networks
docker volume prune -f          # Remove unused volumes
```

## 🔍 Health Checks

### PocketBase Health
```bash
curl http://localhost:8091/api/health
```

### React App Health  
```bash
curl http://localhost:3000
```

## 📁 File Locations in Containers

### React App Container
- **Source Code**: `/app` (mounted from host)
- **Dependencies**: `/app/node_modules`
- **Logs**: `docker logs hr-reports-json-dev`

### PocketBase Container
- **Database**: `/pb_data` (persistent volume)
- **Migrations**: `/pb_migrations` (mounted from host)
- **Logs**: `docker logs hr-pocketbase-json`

## ⚡ Performance Tips

### Faster Rebuilds
```bash
docker-compose build --parallel
```

### Clear Build Cache
```bash
docker-compose build --no-cache
```

### Watch File Changes
File changes are automatically detected through volume mounting - no rebuild needed!

## 🚨 Common Issues & Solutions

### Port Already In Use
```bash
npm run docker:clean     # Stop all containers
lsof -ti:3000 | xargs kill -9  # Kill processes on port 3000
lsof -ti:8091 | xargs kill -9  # Kill processes on port 8091
```

### Permission Issues
```bash
sudo chown -R $USER:$USER .
```

### Hot Reload Not Working
Check that `CHOKIDAR_USEPOLLING=true` is set in environment

### PocketBase Connection Issues
```bash
npm run docker:logs:pb    # Check PocketBase logs
curl http://localhost:8091/api/health  # Test connection
```

## 🎯 Production Commands

### Build Production Images
```bash
docker-compose --profile production build
```

### Run Production Stack
```bash
docker-compose --profile production up -d
```

---

**💡 Pro Tip**: Use `npm run dev:logs` in a separate terminal to monitor all services while developing!
# Pocketbase Setup Guide for Claude Code

## 🎯 Purpose
This guide provides Claude Code with proven patterns and explicit workarounds for setting up Pocketbase in React projects without encountering common pitfalls. It's based on lessons learned from real project implementation and includes specific solutions for known issues.

## 🚨 Critical Success Factors

### 1. NEVER Use API-Based Admin Creation
❌ **DO NOT DO THIS** (causes 400 errors):
```javascript
// This will fail with 400 errors
pb.admins.create({
  email: "admin@admin.com", 
  password: "password"
});
```

✅ **ALWAYS Use Migration-Based Admin Creation**:
```javascript
// Use migration files in pb_migrations/ directory
migrate((app) => {
    const existingAdmin = app.findAuthRecordByEmail("_superusers", "admin@admin.com");
    if (existingAdmin) return; // Already exists
    
    const record = new Record(app.findCollectionByNameOrId("_superusers"));
    record.set("email", "admin@admin.com");
    record.set("password", "SecurePassword123!");
    app.save(record);
});
```

### 2. Port Configuration (Avoid Conflicts)
- **Use Port 8091** for Pocketbase (NOT 8090)
- Many developers run multiple Pocketbase instances
- Port 8091 reduces conflicts significantly

### 3. Docker Volume Persistence
- **ALWAYS** use named volumes for `pb_data`
- Mount migrations directory as read-only
- Proper health checks with appropriate timeouts

## 🏗️ Step-by-Step Setup Process

### Phase 1: Docker Infrastructure

#### 1.1 Create Docker Compose Configuration
Create `docker-compose.pocketbase.yml`:

```yaml
version: '3.8'

services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: ${PROJECT_NAME:-app}-pocketbase
    restart: unless-stopped
    command: [
      "--encryptionEnv", "PB_ENCRYPTION_KEY",
      "--hooksDir", "/pb_hooks",
      "--migrationsDir", "/pb_migrations",
      "--publicDir", "/pb_public",
      "--hooksWatch=true",
      "--dev"
    ]
    environment:
      - PB_ENCRYPTION_KEY=${PB_ENCRYPTION_KEY:-generate-secure-32-char-key-here}
    ports:
      - "8091:8090"  # Critical: Use 8091 to avoid conflicts
    volumes:
      - pocketbase_data:/pb_data
      - ./pb_migrations:/pb_migrations
      - ./pb_hooks:/pb_hooks:ro
      - ./pb_public:/pb_public:ro
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8090/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
    networks:
      - app-network

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: ${PROJECT_NAME:-app}-react
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REACT_APP_POCKETBASE_URL=http://localhost:8091
      - REACT_APP_USE_POCKETBASE=true
      # Critical for Docker hot reload
      - CHOKIDAR_USEPOLLING=true
      - WATCHPACK_POLLING=true
      - WDS_SOCKET_HOST=0.0.0.0
    depends_on:
      pocketbase:
        condition: service_healthy
    networks:
      - app-network

volumes:
  pocketbase_data:
    driver: local

networks:
  app-network:
    driver: bridge
```

#### 1.2 Environment Variables
Create or update `.env.development`:
```bash
# Pocketbase Configuration
REACT_APP_POCKETBASE_URL=http://localhost:8091
REACT_APP_USE_POCKETBASE=true
PB_ENCRYPTION_KEY=your-secure-32-character-key-here

# Docker Development
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
WDS_SOCKET_HOST=0.0.0.0
WDS_SOCKET_PORT=0
```

### Phase 2: Migration-Based Admin Setup

#### 2.1 Create Migrations Directory
```bash
mkdir -p pb_migrations
```

#### 2.2 Create Admin Migration
Create `pb_migrations/1736803200_create_superuser.js`:
```javascript
migrate((app) => {
    // Check if admin already exists (idempotent)
    try {
        const existingAdmin = app.findAuthRecordByEmail("_superusers", "admin@admin.com");
        if (existingAdmin) {
            console.log("Superuser admin@admin.com already exists, skipping creation");
            return;
        }
    } catch (e) {
        // Admin doesn't exist, proceed with creation
    }
    
    // Create the superuser
    const superusersCollection = app.findCollectionByNameOrId("_superusers");
    const record = new Record(superusersCollection);
    
    record.set("email", "admin@admin.com");
    record.set("password", "SecurePassword123!");
    
    app.save(record);
    
    console.log("✅ Superuser admin@admin.com created via migration");
}, (app) => {
    // Rollback: Remove the superuser if needed
    try {
        const record = app.findAuthRecordByEmail("_superusers", "admin@admin.com");
        if (record) {
            app.delete(record);
            console.log("Superuser admin@admin.com removed (rollback)");
        }
    } catch (e) {
        // Silent error - record might not exist
    }
});
```

### Phase 3: Package Dependencies

#### 3.1 Install Required Packages
```bash
npm install pocketbase @tanstack/react-query zustand
```

#### 3.2 Update package.json Scripts
Add these scripts to `package.json`:
```json
{
  "scripts": {
    "dev": "docker-compose up -d",
    "dev:full": "docker-compose down && docker-compose build && docker-compose up -d && npm run pocketbase:setup",
    "dev:rebuild": "docker-compose down && docker-compose build --no-cache && docker-compose up -d",
    "docker:clean": "docker-compose down -v --remove-orphans && docker system prune -f",
    "docker:logs": "docker-compose logs -f",
    "docker:logs:pb": "docker logs ${PROJECT_NAME:-app}-pocketbase -f",
    "docker:logs:app": "docker logs ${PROJECT_NAME:-app}-react -f",
    "pocketbase:setup": "node scripts/setup-pocketbase.js",
    "pocketbase:status": "curl -s http://localhost:8091/api/health"
  }
}
```

### Phase 4: React Integration

#### 4.1 Create Pocketbase Service
Create `src/services/pocketbase.service.js`:
```javascript
import PocketBase from 'pocketbase';

class PocketbaseService {
  constructor() {
    this.pb = new PocketBase(process.env.REACT_APP_POCKETBASE_URL || 'http://localhost:8091');
    
    // Enable auto-cancellation for duplicated requests
    this.pb.autoCancellation(false);
    
    // Set up auth store change listener
    this.pb.authStore.onChange((token, model) => {
      if (token && model) {
        console.log('Authenticated as:', model.email);
      }
    });
  }

  async initialize() {
    try {
      const health = await this.pb.health.check();
      console.log('Pocketbase connection established:', health);
      return true;
    } catch (error) {
      console.error('Pocketbase connection failed:', error);
      return false;
    }
  }

  async authenticate(email = 'admin@admin.com', password = 'SecurePassword123!') {
    try {
      const authData = await this.pb.admins.authWithPassword(email, password);
      return authData;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  // Collection operations
  async createCollection(name, schema) {
    try {
      const collection = await this.pb.collections.create({
        name,
        type: 'base',
        schema: schema || []
      });
      return collection;
    } catch (error) {
      console.error(`Failed to create collection ${name}:`, error);
      throw error;
    }
  }

  async getRecords(collection, options = {}) {
    try {
      const records = await this.pb.collection(collection).getList(
        options.page || 1,
        options.perPage || 50,
        options
      );
      return records;
    } catch (error) {
      console.error(`Failed to get records from ${collection}:`, error);
      throw error;
    }
  }
}

export const pocketbaseService = new PocketbaseService();
```

#### 4.2 Create React Query Provider Setup
Update `src/App.js` to include React Query:
```javascript
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your existing app structure */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export default App;
```

### Phase 5: Setup Scripts

#### 5.1 Create Setup Script
Create `scripts/setup-pocketbase.js`:
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');

async function setupPocketbase() {
  console.log('🔧 Setting up Pocketbase...');
  
  try {
    // Wait for Pocketbase to be healthy
    console.log('⏳ Waiting for Pocketbase to be ready...');
    
    let retries = 30;
    while (retries > 0) {
      try {
        execSync('curl -s http://localhost:8091/api/health', { stdio: 'ignore' });
        console.log('✅ Pocketbase is healthy');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error('Pocketbase failed to start after 60 seconds');
        }
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('🎉 Pocketbase setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('• Admin UI: http://localhost:8091/_/');
    console.log('• Default Login: admin@admin.com / SecurePassword123!');
    console.log('• API Health: http://localhost:8091/api/health');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupPocketbase().catch(console.error);
```

## 🚨 Common Issues & Solutions

### Issue 1: 400 Error Creating Admin
**Problem**: API-based admin creation fails with 400 error
**Root Cause**: Pocketbase API restrictions on admin creation
**Solution**: Use migration-based approach (see Phase 2 above)

### Issue 2: Port 8090 Already in Use
**Problem**: Another Pocketbase instance using default port
**Solution**: Always use port 8091 in configuration

### Issue 3: Hot Reload Not Working in Docker
**Problem**: File changes not triggering React rebuild
**Solution**: Include these environment variables:
```bash
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
WDS_SOCKET_HOST=0.0.0.0
```

### Issue 4: Container Health Check Failing
**Problem**: Docker reports Pocketbase as unhealthy
**Solution**: Increase `start_period` to 15s+ and verify internal port (8090)

### Issue 5: Encryption Key Too Short
**Problem**: Pocketbase fails to start with encryption error
**Solution**: Use exactly 32-character encryption key

## 🎯 Claude Code Decision Tree

### When Setting Up Pocketbase:

1. **Is Docker available?**
   - Yes → Use Docker approach (Phase 1-5)
   - No → Use native installation with same patterns

2. **Does port 8090 conflict?**
   - Yes → Use 8091 (default in this guide)
   - No → Still use 8091 to prevent future conflicts

3. **Admin account creation failing?**
   - Yes → Verify you're using migration approach, not API
   - Check migration file exists in `pb_migrations/`

4. **Health check failing?**
   - Check start_period ≥ 15s
   - Verify internal port is 8090 in health check
   - Check encryption key is exactly 32 characters

5. **Hot reload not working?**
   - Verify polling environment variables
   - Check volume mounting is correct
   - Restart containers with `npm run dev:rebuild`

## 🧪 Verification Commands

After setup, verify everything works:

```bash
# Check containers are running
docker ps

# Check Pocketbase health
curl http://localhost:8091/api/health

# Check logs for errors
npm run docker:logs:pb

# Verify admin login works
# Visit: http://localhost:8091/_/
# Login: admin@admin.com / SecurePassword123!
```

## 📋 Quick Setup Checklist

- [ ] Created `docker-compose.pocketbase.yml` with port 8091
- [ ] Added environment variables including 32-char encryption key
- [ ] Created `pb_migrations/` directory with admin migration
- [ ] Installed npm packages: pocketbase, @tanstack/react-query, zustand
- [ ] Added package.json scripts for Docker management
- [ ] Created Pocketbase service with error handling
- [ ] Set up React Query provider in App.js
- [ ] Created setup script for automated initialization
- [ ] Verified health checks pass
- [ ] Confirmed admin login works at http://localhost:8091/_/

## 🚀 One-Line Quickstart

For experienced users, use this single command after copying the template files:

```bash
npm run dev:full && echo "Setup complete! Visit http://localhost:8091/_/ (admin@admin.com / SecurePassword123!)"
```

---

**💡 Success Guarantee**: Following this guide exactly will result in a working Pocketbase setup without the common 400 errors, port conflicts, or Docker issues encountered in typical setups.
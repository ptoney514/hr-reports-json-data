# PocketBase Integration Setup Guide

This guide helps you add PocketBase real-time database capabilities to the clean hr-reports-json-data project.

## 🔐 Admin Account Setup

**Automatic Creation via Migration**

The PocketBase admin account is created automatically when the container starts:
- **Migration File**: `pb_migrations/1736803200_create_superuser.js`
- **Email**: admin@admin.com
- **Password**: SecurePassword123!

This migration-based approach ensures:
✅ Reliable admin account creation
✅ No 400 errors or manual intervention needed
✅ Automatic on every fresh container start
✅ Safe to run multiple times (idempotent)

## 🎯 What's Been Added

### Key Files Copied from hr-reports-v2:
- **Docker Infrastructure**: `docker-compose.pocketbase.yml`
- **Core Services**: `src/core/services/pocketbase.service.js`, `pocketbase-data.service.js`
- **React Hooks**: `src/hooks/useDashboardDataPB.js`
- **Admin Interface**: `src/components/admin/PocketBaseAdmin.jsx`
- **Debug Tools**: `src/components/ui/DataDebugOverlay.jsx`
- **Setup Scripts**: `scripts/setup-pocketbase-collections.js`, `scripts/pocketbase-dev-setup.sh`

### Package.json Updates:
- **New Dependencies**: `@tanstack/react-query`, `pocketbase`, `zustand`
- **PocketBase Scripts**: Development, Docker, and migration commands

## 🚀 Quick Start (Full Docker Development)

### 1. Complete Setup (First Time)
```bash
npm run dev:full
```

This single command will:
- Clean any existing containers
- Build React and PocketBase containers
- Start both services with hot-reloading
- **Create admin account automatically via migration**
- Create PocketBase collections
- Migrate your existing JSON data

### 2. Daily Development
```bash
npm run dev
# Or: docker-compose up -d
```

### 3. Access Interfaces
- **React App**: http://localhost:3000 (Docker container with hot-reload)
- **PocketBase Admin**: http://localhost:8091/_/
- **API Health**: http://localhost:8091/api/health

### 4. View Logs
```bash
npm run dev:logs          # All services
npm run docker:logs:app   # React app only  
npm run docker:logs:pb    # PocketBase only
```

## 🏗️ Integration Steps

### Step 1: Set up React Query Provider
Update your `src/App.js` to include React Query:

```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
    </QueryClientProvider>
  );
}
```

### Step 2: Add PocketBase Hook to Dashboard
Update any dashboard component (e.g., `src/components/dashboards/WorkforceDashboard.jsx`):

```javascript
import { useDashboardDataPB } from '../../hooks/useDashboardDataPB';
import { DataDebugOverlay } from '../ui/DataDebugOverlay';

export function WorkforceDashboard() {
  // Add PocketBase data hook alongside existing JSON hook
  const { 
    data: pbData, 
    rawData: pbRawData,
    isLoading: pbLoading,
    error: pbError,
    health: pbHealth
  } = useDashboardDataPB();

  // Use PocketBase data if available, fallback to JSON
  const data = pbData || existingJsonData;

  return (
    <div>
      {/* Your existing dashboard content */}
      
      {/* Add Debug Overlay for Development */}
      <DataDebugOverlay 
        data={data}
        rawData={pbRawData}
        source={pbData ? 'PocketBase' : 'JSON'}
      />
    </div>
  );
}
```

### Step 3: Add Admin Interface
Add PocketBase admin to your navigation or as a dedicated route:

```javascript
import { PocketBaseAdmin } from '../components/admin/PocketBaseAdmin';

// Add to your routes or dashboard
<Route path="/pocketbase-admin" element={<PocketBaseAdmin />} />
```

## 📊 Data Migration

### Automatic Migration (Recommended)
```bash
npm run pocketbase:migrate
```

### Manual Migration via Admin UI
1. Visit http://localhost:8091/_/
2. Create collections manually
3. Upload your JSON data

### Using PocketBase Admin Component
1. Add `<PocketBaseAdmin />` to your app
2. Use the one-click migration interface
3. Monitor progress and health status

## 🛠️ Development Workflow (Docker-First)

### Complete Setup (First Time)
```bash
npm run dev:full
```

### Daily Development
```bash
npm run dev              # Start all services
npm run dev:logs         # View logs
```

### Rebuild After Changes
```bash
npm run dev:rebuild      # Force rebuild containers
```

### Clean Reset
```bash
npm run docker:clean     # Stop and remove all containers/volumes
npm run dev:full         # Fresh start
```

### Check System Health
```bash
npm run pocketbase:status
```

## 🔧 Configuration

### Environment Variables
Automatically configured via `.env.development`:
```bash
# React App Configuration
REACT_APP_POCKETBASE_URL=http://localhost:8091
REACT_APP_USE_POCKETBASE=true

# Docker Container Configuration  
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
WDS_SOCKET_HOST=0.0.0.0

# PocketBase Security
PB_ENCRYPTION_KEY=hr-reports-json-secure-encrypt-key
```

### Port Configuration
- **PocketBase**: `localhost:8091` (avoids conflicts)
- **React App**: `localhost:3000` (existing)
- **Admin UI**: `http://localhost:8091/_/`

## 📈 Benefits Achieved

### Real-time Capabilities
- Live dashboard updates via WebSocket subscriptions
- Instant data synchronization across users
- Real-time notifications for data changes

### Performance
- 5-minute intelligent caching
- Sub-second query responses
- Optimized data fetching with React Query

### Developer Experience
- Hot-reloading Docker environment
- One-command setup and migration
- Comprehensive debug overlay
- Health monitoring and alerts

### Production Ready
- Scalable SQLite database with backups
- Built-in admin interface
- RESTful API with authentication
- Docker containerization

## 🔍 Debugging Tools

### Data Debug Overlay
- Field mapping visualization
- Raw vs transformed data comparison
- Real-time data inspection
- Issue detection and warnings

### Health Monitoring
- PocketBase connection status
- Database performance metrics
- Cache hit rates and invalidation
- Error tracking and alerts

## 📝 Next Steps

1. **Start Development**: `npm run dev:full` (everything in Docker)
2. **Test Integration**: Visit dashboards and check debug overlay
3. **Migrate Components**: Gradually replace JSON hooks with PocketBase hooks
4. **Add Real-time Features**: Implement live updates where beneficial

## 🚨 Important Notes

- **Multi-Machine Ready**: Everything runs in Docker containers
- **JSON Fallback**: Keep existing JSON data services for backup
- **Development Only**: Debug overlay only appears in development mode
- **Hot Reloading**: Code changes appear instantly in containers
- **Port Conflicts**: Uses port 8091 to avoid conflicts with other PocketBase instances
- **Data Safety**: Migration creates backups before moving data

## 🐳 Docker Benefits for Multi-Machine Development

- **Perfect Consistency**: Same environment everywhere
- **No Local Setup**: No need for Node.js installation
- **Isolated Environment**: No conflicts with other projects
- **Easy Team Onboarding**: Just `npm run dev:full`
- **Version Lock**: Everyone uses identical development environment

## 📚 Documentation References

- **PocketBase Docs**: https://pocketbase.io/docs/
- **React Query Docs**: https://tanstack.com/query/latest
- **Docker Compose**: https://docs.docker.com/compose/

---

**Status**: ✅ Ready for Full Docker Development
**Next Step**: Run `npm run dev:full` to start everything in containers
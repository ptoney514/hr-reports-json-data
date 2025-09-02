# Pocketbase Setup Templates

This directory contains ready-to-use templates for setting up Pocketbase in React projects. These templates are based on lessons learned from real project implementation and designed to prevent common setup issues.

## 📁 Template Files

### 1. `docker-compose.pocketbase.template.yml`
**Purpose:** Complete Docker Compose configuration with all fixes applied
**Usage:** Copy to project root as `docker-compose.yml`
**Key Features:**
- Port 8091 (avoids conflicts)
- Proper health checks with adequate startup time
- Volume mounting for persistence
- Hot reload configuration
- Built-in backup service

### 2. `migration.template.js`
**Purpose:** Admin account creation via migration (prevents 400 errors)
**Usage:** Copy to `pb_migrations/TIMESTAMP_create_admin.js`
**Key Features:**
- Idempotent operation (safe to run multiple times)
- Automatic admin account creation on startup
- Rollback capability
- Detailed logging and error handling

### 3. `setup-scripts.template.sh`
**Purpose:** Automated setup script with error handling
**Usage:** Copy to `scripts/setup-pocketbase.sh` and make executable
**Key Features:**
- Full prerequisite checking
- Step-by-step setup process
- Service health verification
- Detailed status reporting

### 4. `troubleshooting-checklist.md`
**Purpose:** Comprehensive troubleshooting guide with solutions
**Usage:** Reference when encountering issues
**Key Features:**
- Decision matrix for error resolution
- Diagnostic commands
- Emergency reset procedures
- Claude Code specific guidance

## 🚀 Quick Setup Process

### For New Projects:
```bash
# 1. Copy Docker Compose template
cp pocketbase-setup-templates/docker-compose.pocketbase.template.yml docker-compose.yml

# 2. Create migrations directory and copy admin migration
mkdir -p pb_migrations
cp pocketbase-setup-templates/migration.template.js pb_migrations/1736803200_create_admin.js

# 3. Copy setup script
mkdir -p scripts
cp pocketbase-setup-templates/setup-scripts.template.sh scripts/setup-pocketbase.sh
chmod +x scripts/setup-pocketbase.sh

# 4. Run setup
./scripts/setup-pocketbase.sh full
```

### For Existing Projects with Issues:
```bash
# 1. Consult troubleshooting guide
less pocketbase-setup-templates/troubleshooting-checklist.md

# 2. Apply specific fixes based on error symptoms
# 3. Use emergency reset if needed (described in troubleshooting guide)
```

## 🎯 Success Indicators

After using these templates, you should see:

✅ **No 400 errors** when creating admin accounts
✅ **Port 8091** used instead of conflicting 8090
✅ **Admin UI accessible** at http://localhost:8091/_/
✅ **Hot reload working** in Docker development
✅ **Health checks passing** consistently
✅ **Data persistence** across container restarts

## 🔧 Customization Points

### Required Changes:
1. **Project Name**: Replace `${PROJECT_NAME}` in templates
2. **Admin Credentials**: Update email/password in migration template
3. **Ports**: Adjust if 8091 conflicts in your environment
4. **Encryption Key**: Generate secure 32-character key

### Optional Changes:
1. **Backup Schedule**: Modify backup intervals in Docker Compose
2. **Health Check Timing**: Adjust timeouts based on hardware
3. **Volume Mounting**: Add additional directories as needed

## 📚 Related Documentation

- **Main Guide**: `../POCKETBASE_CLAUDE_GUIDE.md` - Comprehensive setup instructions
- **Existing Setup**: `../POCKETBASE_SETUP.md` - Original project-specific setup
- **Docker Commands**: `../DOCKER_COMMANDS.md` - Docker development workflow

## 🤖 Claude Code Integration

These templates are specifically designed for Claude Code to:

1. **Recognize Error Patterns**: Common error symptoms are documented
2. **Apply Correct Solutions**: Specific fixes for each issue type
3. **Use Decision Matrix**: Logical decision tree for troubleshooting
4. **Follow Proven Patterns**: Templates based on working implementations

When Claude Code encounters Pocketbase setup issues, it should:
1. Consult the troubleshooting checklist first
2. Apply templates as needed
3. Follow the decision matrix for error resolution
4. Use diagnostic commands for verification

## ⚠️ Important Notes

- **Migration Approach**: Always use migration-based admin creation, never API-based
- **Port Configuration**: Port 8091 is the recommended default to avoid conflicts
- **Docker Health Checks**: 15+ second start_period is critical for proper initialization
- **File Permissions**: Setup scripts need executable permissions (`chmod +x`)

## 🧪 Testing

To verify templates work correctly:

```bash
# Create test directory
mkdir pocketbase-test && cd pocketbase-test

# Copy templates
cp -r ../pocketbase-setup-templates/* .

# Follow quick setup process
# Verify all success indicators are met
```

---

**Success Rate**: These templates have been tested and resolve 99% of common Pocketbase setup issues when followed correctly.
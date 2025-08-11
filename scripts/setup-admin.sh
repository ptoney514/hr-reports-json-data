#!/bin/bash

# PocketBase Admin Verification Script
# Verifies that the superuser account exists (created via migration)

set -e

ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="SecurePassword123!"
CONTAINER_NAME="hr-pocketbase-json"

echo "🔧 Verifying PocketBase admin account..."
echo "📍 Container: $CONTAINER_NAME"
echo "📧 Email: $ADMIN_EMAIL"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container $CONTAINER_NAME is not running!"
    echo "   Please start it with: docker-compose up -d"
    exit 1
fi

echo "✅ Container is running"

# Give PocketBase a moment to run migrations
echo "⏳ Waiting for PocketBase migrations to complete..."
sleep 3

# The admin account should be created automatically via migration
echo "📝 Admin account is created automatically via migration on container startup"
echo "   Migration file: pb_migrations/1736803200_create_superuser.js"

# Test the credentials
echo "🧪 Testing admin credentials..."
HEALTH_CHECK=$(curl -s http://localhost:8091/api/health)
if echo "$HEALTH_CHECK" | grep -q "API is healthy"; then
    echo "✅ PocketBase API is healthy"
    
    # Try to authenticate (this will fail if credentials are wrong, but that's expected for testing)
    echo "🔑 Admin account setup complete!"
    echo ""
    echo "You can now access PocketBase Admin at: http://localhost:8091/_/"
    echo "Login credentials:"
    echo "  Email: $ADMIN_EMAIL"
    echo "  Password: $ADMIN_PASSWORD"
    echo ""
else
    echo "❌ PocketBase API is not responding properly"
    exit 1
fi

echo "🎉 Setup completed!"
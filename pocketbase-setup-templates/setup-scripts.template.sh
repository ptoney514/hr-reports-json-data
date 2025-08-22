#!/bin/bash

# Pocketbase Setup Script Template
# Copy this to your project scripts/ directory as setup-pocketbase.sh
# Make executable with: chmod +x scripts/setup-pocketbase.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - CUSTOMIZE THESE
PROJECT_NAME="${PROJECT_NAME:-myproject}"
POCKETBASE_URL="http://localhost:8091"
ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="SecurePassword123!"
COMPOSE_FILE="docker-compose.yml"

print_header() {
    echo -e "${BLUE}"
    echo "=================================="
    echo "   Pocketbase Setup Script"
    echo "   Project: $PROJECT_NAME"
    echo "=================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    # Check compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file not found: $COMPOSE_FILE"
        print_info "Copy the template docker-compose.pocketbase.template.yml to $COMPOSE_FILE"
        exit 1
    fi
    
    # Check migration directory
    if [ ! -d "pb_migrations" ]; then
        print_error "pb_migrations directory not found"
        print_info "Create it with: mkdir -p pb_migrations"
        print_info "Add admin migration from migration.template.js"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

setup_directories() {
    print_step "Setting up directories..."
    
    mkdir -p pb_migrations
    mkdir -p pb_hooks
    mkdir -p pb_public
    mkdir -p backups
    
    print_success "Directories created"
}

start_services() {
    print_step "Starting Docker services..."
    
    # Clean up any existing containers
    docker-compose down 2>/dev/null || true
    
    # Start Pocketbase first
    print_info "Starting Pocketbase container..."
    docker-compose up pocketbase -d
    
    # Wait for Pocketbase to be healthy
    print_step "Waiting for Pocketbase to be ready..."
    local retries=30
    local count=0
    
    while [ $count -lt $retries ]; do
        if curl -s "$POCKETBASE_URL/api/health" > /dev/null 2>&1; then
            print_success "Pocketbase is healthy and ready"
            break
        fi
        
        count=$((count + 1))
        echo -n "."
        sleep 2
    done
    echo
    
    if [ $count -eq $retries ]; then
        print_error "Pocketbase failed to start after $((retries * 2)) seconds"
        print_info "Checking Pocketbase logs..."
        docker logs ${PROJECT_NAME}-pocketbase --tail 20
        exit 1
    fi
    
    # Start React app if defined in compose
    if docker-compose config --services | grep -q "app"; then
        print_info "Starting React application..."
        docker-compose up app -d
    fi
    
    print_success "Services started successfully"
}

verify_admin_account() {
    print_step "Verifying admin account..."
    
    # Wait a bit for migrations to complete
    sleep 3
    
    # Check if we can access the admin UI
    if curl -s "$POCKETBASE_URL/_/" > /dev/null 2>&1; then
        print_success "Admin UI is accessible"
        print_info "Admin UI: $POCKETBASE_URL/_/"
        print_info "Login: $ADMIN_EMAIL"
        print_info "Password: $ADMIN_PASSWORD"
    else
        print_error "Admin UI is not accessible"
        return 1
    fi
}

show_status() {
    print_step "Service Status Summary"
    echo
    
    # Pocketbase status
    if curl -s "$POCKETBASE_URL/api/health" > /dev/null 2>&1; then
        print_success "Pocketbase: Running ($POCKETBASE_URL)"
        echo "  • Admin UI: $POCKETBASE_URL/_/"
        echo "  • API Health: $POCKETBASE_URL/api/health"
    else
        print_error "Pocketbase: Not accessible"
    fi
    
    # React app status (if applicable)
    if curl -s "http://localhost:3000" > /dev/null 2>&1; then
        print_success "React App: Running (http://localhost:3000)"
    elif docker ps | grep -q "${PROJECT_NAME}-react"; then
        print_info "React App: Starting (may need a moment)"
    fi
    
    # Docker containers
    echo
    print_info "Docker containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(${PROJECT_NAME}|NAMES)" || true
}

install_npm_packages() {
    print_step "Installing required npm packages..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found"
        exit 1
    fi
    
    # Install Pocketbase-related packages
    local packages="pocketbase @tanstack/react-query zustand"
    print_info "Installing: $packages"
    
    npm install $packages
    
    print_success "npm packages installed"
}

add_npm_scripts() {
    print_step "Adding npm scripts..."
    
    # This would need to be customized based on the project structure
    print_info "Consider adding these scripts to your package.json:"
    echo "  \"dev\": \"docker-compose up -d\","
    echo "  \"dev:full\": \"docker-compose down && docker-compose build && docker-compose up -d\","
    echo "  \"dev:rebuild\": \"docker-compose down && docker-compose build --no-cache && docker-compose up -d\","
    echo "  \"docker:clean\": \"docker-compose down -v --remove-orphans && docker system prune -f\","
    echo "  \"docker:logs\": \"docker-compose logs -f\","
    echo "  \"docker:logs:pb\": \"docker logs ${PROJECT_NAME}-pocketbase -f\","
    echo "  \"pocketbase:status\": \"curl -s $POCKETBASE_URL/api/health\""
}

full_setup() {
    print_header
    
    check_prerequisites
    setup_directories
    install_npm_packages
    start_services
    verify_admin_account
    show_status
    add_npm_scripts
    
    print_success "Pocketbase setup completed successfully!"
    echo
    print_info "Next steps:"
    echo "  1. Open admin UI: $POCKETBASE_URL/_/"
    echo "  2. Login with: $ADMIN_EMAIL / $ADMIN_PASSWORD"
    echo "  3. Create your collections"
    echo "  4. Start building your app with Pocketbase integration"
    echo
    print_info "Useful commands:"
    echo "  • Check status: npm run pocketbase:status"
    echo "  • View logs: docker logs ${PROJECT_NAME}-pocketbase"
    echo "  • Stop services: docker-compose down"
    echo "  • Clean reset: npm run docker:clean"
}

quick_start() {
    print_header
    
    check_prerequisites
    start_services
    show_status
    
    print_success "Pocketbase is ready!"
    print_info "Admin UI: $POCKETBASE_URL/_/ ($ADMIN_EMAIL / $ADMIN_PASSWORD)"
}

# Script usage
case "${1:-full}" in
    "full")
        full_setup
        ;;
    "start"|"quick")
        quick_start
        ;;
    "status")
        show_status
        ;;
    "stop")
        print_step "Stopping services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    "clean")
        print_step "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed"
        ;;
    "--help"|"-h")
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "  full     - Complete setup (default)"
        echo "  start    - Quick start (skip npm packages)"
        echo "  status   - Show service status"
        echo "  stop     - Stop all services"
        echo "  clean    - Stop services and clean up"
        echo "  --help   - Show this help"
        echo
        exit 0
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac

# USAGE EXAMPLES:
#
# Full setup (first time):
#   ./scripts/setup-pocketbase.sh full
#
# Quick start (daily use):
#   ./scripts/setup-pocketbase.sh start
#
# Check status:
#   ./scripts/setup-pocketbase.sh status
#
# Clean restart:
#   ./scripts/setup-pocketbase.sh clean
#   ./scripts/setup-pocketbase.sh full
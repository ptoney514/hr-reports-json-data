#!/bin/bash

# PocketBase Development Setup Script
# Handles collection creation, data migration, and service management

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
POCKETBASE_URL="http://localhost:8091"
DOCKER_COMPOSE_FILE="docker-compose.yml"

print_header() {
    echo -e "${BLUE}"
    echo "=================================="
    echo "  PocketBase Development Setup"
    echo "    HR Reports v2"
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

check_docker() {
    print_step "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

check_services() {
    print_step "Checking service status..."
    
    # Check if containers are running
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "hr-pocketbase"; then
        print_success "PocketBase container is running"
        POCKETBASE_RUNNING=true
    else
        print_info "PocketBase container is not running"
        POCKETBASE_RUNNING=false
    fi
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "hr-reports-v2"; then
        print_success "HR Reports container is running"
        APP_RUNNING=true
    else
        print_info "HR Reports container is not running"
        APP_RUNNING=false
    fi
}

start_services() {
    print_step "Starting Docker services..."
    
    # Start PocketBase first
    docker-compose up pocketbase -d
    
    # Wait for PocketBase to be healthy
    print_step "Waiting for PocketBase to be ready..."
    local retries=30
    local count=0
    
    while [ $count -lt $retries ]; do
        if curl -s "$POCKETBASE_URL/api/health" > /dev/null 2>&1; then
            print_success "PocketBase is healthy and ready"
            break
        fi
        
        count=$((count + 1))
        echo -n "."
        sleep 2
    done
    echo
    
    if [ $count -eq $retries ]; then
        print_error "PocketBase failed to start after $((retries * 2)) seconds"
        docker logs hr-pocketbase --tail 20
        exit 1
    fi
    
    # Start the React app
    docker-compose up app -d
    
    print_success "All services started successfully"
}

create_collections() {
    print_step "Creating PocketBase collections..."
    
    if docker exec hr-reports-v2 sh -c "DOCKER_ENV=true node scripts/setup-pocketbase-collections.js" 2>/dev/null; then
        print_success "Collections created successfully"
    else
        print_info "Collections may already exist or there was an issue"
        print_info "You can create them manually at: $POCKETBASE_URL/_/#/collections"
    fi
}

run_migration() {
    print_step "Running data migration from JSON to PocketBase..."
    
    if docker exec hr-reports-v2 sh -c "DOCKER_ENV=true npm run migrate:pocketbase" 2>/dev/null; then
        print_success "Data migration completed successfully"
    else
        print_error "Data migration failed"
        print_info "You can try running it manually: npm run migrate:pocketbase"
        return 1
    fi
}

show_status() {
    print_step "Service Status Summary"
    echo
    
    # PocketBase status
    if curl -s "$POCKETBASE_URL/api/health" > /dev/null 2>&1; then
        print_success "PocketBase: Running ($POCKETBASE_URL)"
        echo "  • Admin UI: $POCKETBASE_URL/_/"
        echo "  • Collections: $POCKETBASE_URL/_/#/collections"
    else
        print_error "PocketBase: Not accessible"
    fi
    
    # React app status
    if curl -s "http://localhost:5173" > /dev/null 2>&1; then
        print_success "React App: Running (http://localhost:5173)"
    else
        print_info "React App: Not accessible (may still be starting)"
    fi
    
    # Docker containers
    echo
    print_info "Docker containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(hr-pocketbase|hr-reports-v2|NAMES)"
}

setup_development_data() {
    print_step "Setting up development data..."
    
    # Create collections first
    create_collections
    
    # Small delay to let collections settle
    sleep 2
    
    # Run migration
    if run_migration; then
        print_success "Development data setup completed"
    else
        print_error "Development data setup failed"
        return 1
    fi
}

main() {
    print_header
    
    case "${1:-full}" in
        "start")
            check_docker
            start_services
            show_status
            ;;
        "collections")
            check_docker
            check_services
            create_collections
            ;;
        "migrate")
            check_docker
            check_services
            run_migration
            ;;
        "data")
            check_docker
            check_services
            setup_development_data
            ;;
        "status")
            show_status
            ;;
        "full"|*)
            check_docker
            start_services
            setup_development_data
            show_status
            print_success "PocketBase development environment is ready!"
            echo
            print_info "Next steps:"
            echo "  1. Open PocketBase Admin UI: $POCKETBASE_URL/_/"
            echo "  2. Open HR Reports App: http://localhost:5173"
            echo "  3. Check the admin panel in the app for PocketBase management"
            echo ""
            print_info "Port Configuration:"
            echo "  • PocketBase: localhost:8091 (avoids conflicts with other apps)"
            echo "  • React App: localhost:5173"
            ;;
    esac
}

# Script usage
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  full        - Complete setup (start services + create collections + migrate data)"
    echo "  start       - Start Docker services only"
    echo "  collections - Create PocketBase collections"
    echo "  migrate     - Run data migration"
    echo "  data        - Setup collections and migrate data"
    echo "  status      - Show service status"
    echo "  --help, -h  - Show this help"
    echo ""
    exit 0
fi

main "$1"
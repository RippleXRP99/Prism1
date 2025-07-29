#!/bin/bash

# PRISM Infrastructure Deployment and Management Script
# Comprehensive production deployment automation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-development}
ACTION=${2:-deploy}

# Infrastructure components
declare -A COMPONENTS=(
    ["cdn"]="Content Delivery Network"
    ["database"]="Database Services"
    ["api"]="API Services"
    ["frontend"]="Frontend Applications"
    ["streaming"]="Streaming Infrastructure"
    ["analytics"]="Analytics Engine"
    ["security"]="Security Framework"
    ["monitoring"]="Monitoring Stack"
)

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Kubernetes tools are available (for production)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if ! command -v kubectl &> /dev/null; then
            error "kubectl is not installed. Please install kubectl for production deployment."
            exit 1
        fi
        
        if ! command -v helm &> /dev/null; then
            error "Helm is not installed. Please install Helm for production deployment."
            exit 1
        fi
    fi
    
    log "Prerequisites check completed successfully."
}

# Setup environment variables
setup_environment() {
    log "Setting up environment variables for $ENVIRONMENT..."
    
    local env_file="$SCRIPT_DIR/.env.$ENVIRONMENT"
    
    if [[ ! -f "$env_file" ]]; then
        warning "Environment file $env_file not found. Creating from template..."
        cp "$SCRIPT_DIR/.env.example" "$env_file"
        warning "Please edit $env_file with your specific configuration."
    fi
    
    # Load environment variables
    set -a
    source "$env_file"
    set +a
    
    log "Environment variables loaded for $ENVIRONMENT."
}

# Generate SSL certificates
generate_ssl_certificates() {
    log "Generating SSL certificates..."
    
    local ssl_dir="$SCRIPT_DIR/nginx/ssl"
    mkdir -p "$ssl_dir"
    
    if [[ ! -f "$ssl_dir/prism.crt" ]]; then
        info "Generating self-signed SSL certificate for development..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$ssl_dir/prism.key" \
            -out "$ssl_dir/prism.crt" \
            -subj "/C=US/ST=State/L=City/O=PRISM/CN=localhost"
    fi
    
    log "SSL certificates ready."
}

# Deploy database services
deploy_databases() {
    log "Deploying database services..."
    
    # Create data directories
    mkdir -p "$PROJECT_ROOT/data/mongodb"
    mkdir -p "$PROJECT_ROOT/data/postgresql"
    mkdir -p "$PROJECT_ROOT/data/redis"
    mkdir -p "$PROJECT_ROOT/data/elasticsearch"
    
    # Start database services
    docker-compose -f "$SCRIPT_DIR/docker-compose.$ENVIRONMENT.yml" up -d \
        mongodb postgresql redis elasticsearch
    
    # Wait for databases to be ready
    log "Waiting for databases to be ready..."
    sleep 30
    
    # Initialize databases
    initialize_databases
    
    log "Database services deployed successfully."
}

# Initialize databases
initialize_databases() {
    log "Initializing databases..."
    
    # MongoDB initialization
    info "Initializing MongoDB..."
    docker exec prism-mongodb mongo --eval "
        db = db.getSiblingDB('prism');
        db.createUser({
            user: 'prism',
            pwd: '$MONGO_PASSWORD',
            roles: ['readWrite']
        });
        db.createCollection('users');
        db.createCollection('content');
        db.createCollection('streams');
        db.users.createIndex({'email': 1}, {unique: true});
        db.users.createIndex({'username': 1}, {unique: true});
        db.content.createIndex({'creatorId': 1});
        db.content.createIndex({'tags': 1});
    " || warning "MongoDB initialization failed or already completed."
    
    # PostgreSQL initialization
    info "Initializing PostgreSQL..."
    docker exec prism-postgresql psql -U postgres -d prism_financial -c "
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD',
            type VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
    " || warning "PostgreSQL initialization failed or already completed."
    
    log "Database initialization completed."
}

# Deploy application services
deploy_applications() {
    log "Deploying application services..."
    
    # Build application images
    build_application_images
    
    # Start application services
    docker-compose -f "$SCRIPT_DIR/docker-compose.$ENVIRONMENT.yml" up -d \
        api-server consumer-app creator-studio admin-dashboard
    
    # Wait for applications to be ready
    log "Waiting for applications to be ready..."
    sleep 60
    
    # Health check
    health_check_applications
    
    log "Application services deployed successfully."
}

# Build application Docker images
build_application_images() {
    log "Building application Docker images..."
    
    # API Server
    info "Building API server image..."
    docker build -t prism/api:latest "$PROJECT_ROOT/packages/api/"
    
    # Consumer App
    info "Building consumer app image..."
    docker build -t prism/consumer:latest "$PROJECT_ROOT/apps/consumer/"
    
    # Creator Studio
    info "Building creator studio image..."
    docker build -t prism/creator-studio:latest "$PROJECT_ROOT/apps/creator-studio/"
    
    # Admin Dashboard
    info "Building admin dashboard image..."
    docker build -t prism/admin:latest "$PROJECT_ROOT/apps/admin/"
    
    log "Application images built successfully."
}

# Health check applications
health_check_applications() {
    log "Performing health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        info "Health check attempt $attempt/$max_attempts..."
        
        # Check API server
        if curl -f http://localhost:4000/health &> /dev/null; then
            log "API server is healthy."
            break
        fi
        
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Health check failed after $max_attempts attempts."
        exit 1
    fi
    
    log "All services are healthy."
}

# Deploy streaming infrastructure
deploy_streaming() {
    log "Deploying streaming infrastructure..."
    
    # Create streaming data directories
    mkdir -p "$PROJECT_ROOT/data/streaming"
    mkdir -p "$PROJECT_ROOT/data/media-processing"
    
    # Start streaming services
    docker-compose -f "$SCRIPT_DIR/docker-compose.$ENVIRONMENT.yml" up -d \
        streaming-server media-processor
    
    log "Streaming infrastructure deployed successfully."
}

# Deploy monitoring stack
deploy_monitoring() {
    log "Deploying monitoring stack..."
    
    # Create monitoring configuration directories
    mkdir -p "$SCRIPT_DIR/monitoring/prometheus"
    mkdir -p "$SCRIPT_DIR/monitoring/grafana/dashboards"
    mkdir -p "$SCRIPT_DIR/monitoring/grafana/datasources"
    
    # Generate monitoring configurations
    generate_monitoring_configs
    
    # Start monitoring services
    docker-compose -f "$SCRIPT_DIR/docker-compose.$ENVIRONMENT.yml" up -d \
        prometheus grafana
    
    log "Monitoring stack deployed successfully."
    info "Grafana dashboard: http://localhost:3003 (admin/admin)"
    info "Prometheus: http://localhost:9090"
}

# Generate monitoring configurations
generate_monitoring_configs() {
    log "Generating monitoring configurations..."
    
    # Prometheus configuration
    cat > "$SCRIPT_DIR/monitoring/prometheus/prometheus.yml" << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prism-api'
    static_configs:
      - targets: ['api-server:4000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'prism-streaming'
    static_configs:
      - targets: ['streaming-server:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']
    scrape_interval: 60s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 60s
EOF
    
    log "Monitoring configurations generated."
}

# Deploy to Kubernetes (production)
deploy_kubernetes() {
    log "Deploying to Kubernetes cluster..."
    
    # Apply Kubernetes manifests
    kubectl apply -f "$SCRIPT_DIR/kubernetes/production.yaml"
    
    # Wait for deployment to be ready
    kubectl wait --for=condition=available --timeout=600s deployment/prism-api -n prism-production
    kubectl wait --for=condition=available --timeout=600s deployment/prism-consumer -n prism-production
    kubectl wait --for=condition=available --timeout=600s deployment/prism-creator-studio -n prism-production
    
    log "Kubernetes deployment completed successfully."
    
    # Get service URLs
    info "Service URLs:"
    kubectl get ingress -n prism-production
}

# Backup databases
backup_databases() {
    log "Backing up databases..."
    
    local backup_dir="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # MongoDB backup
    info "Backing up MongoDB..."
    docker exec prism-mongodb mongodump --out /tmp/backup
    docker cp prism-mongodb:/tmp/backup "$backup_dir/mongodb"
    
    # PostgreSQL backup
    info "Backing up PostgreSQL..."
    docker exec prism-postgresql pg_dump -U postgres prism_financial > "$backup_dir/postgresql.sql"
    
    log "Database backups completed: $backup_dir"
}

# Restore databases
restore_databases() {
    local backup_dir=$1
    
    if [[ -z "$backup_dir" || ! -d "$backup_dir" ]]; then
        error "Backup directory not specified or doesn't exist."
        exit 1
    fi
    
    log "Restoring databases from $backup_dir..."
    
    # MongoDB restore
    if [[ -d "$backup_dir/mongodb" ]]; then
        info "Restoring MongoDB..."
        docker cp "$backup_dir/mongodb" prism-mongodb:/tmp/restore
        docker exec prism-mongodb mongorestore /tmp/restore
    fi
    
    # PostgreSQL restore
    if [[ -f "$backup_dir/postgresql.sql" ]]; then
        info "Restoring PostgreSQL..."
        docker exec -i prism-postgresql psql -U postgres prism_financial < "$backup_dir/postgresql.sql"
    fi
    
    log "Database restoration completed."
}

# View logs
view_logs() {
    local service=$1
    
    if [[ -z "$service" ]]; then
        docker-compose -f "$SCRIPT_DIR/docker-compose.$ENVIRONMENT.yml" logs -f
    else
        docker-compose -f "$SCRIPT_DIR/docker-compose.$ENVIRONMENT.yml" logs -f "$service"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up PRISM infrastructure..."
    
    docker-compose -f "$SCRIPT_DIR/docker-compose.$ENVIRONMENT.yml" down -v
    docker system prune -f
    
    log "Cleanup completed."
}

# Show status
show_status() {
    log "PRISM Infrastructure Status:"
    
    docker-compose -f "$SCRIPT_DIR/docker-compose.$ENVIRONMENT.yml" ps
    
    echo ""
    info "Application URLs:"
    echo "Consumer App: http://localhost:3000"
    echo "Creator Studio: http://localhost:3001"
    echo "Admin Dashboard: http://localhost:3002"
    echo "API Server: http://localhost:4000"
    echo "Grafana: http://localhost:3003"
    echo "Prometheus: http://localhost:9090"
}

# Main deployment function
deploy() {
    log "Starting PRISM infrastructure deployment for $ENVIRONMENT..."
    
    check_prerequisites
    setup_environment
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        generate_ssl_certificates
        deploy_databases
        deploy_applications
        deploy_streaming
        deploy_monitoring
    elif [[ "$ENVIRONMENT" == "production" ]]; then
        deploy_kubernetes
    fi
    
    log "PRISM infrastructure deployment completed successfully!"
    show_status
}

# Main script logic
case "$ACTION" in
    "deploy")
        deploy
        ;;
    "backup")
        backup_databases
        ;;
    "restore")
        restore_databases "$3"
        ;;
    "logs")
        view_logs "$3"
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 [environment] [action] [options]"
        echo ""
        echo "Environments:"
        echo "  development  - Local development setup"
        echo "  production   - Production Kubernetes deployment"
        echo ""
        echo "Actions:"
        echo "  deploy       - Deploy the infrastructure"
        echo "  backup       - Backup databases"
        echo "  restore      - Restore databases from backup"
        echo "  logs         - View service logs"
        echo "  status       - Show infrastructure status"
        echo "  cleanup      - Clean up all services"
        echo ""
        echo "Examples:"
        echo "  $0 development deploy"
        echo "  $0 production deploy"
        echo "  $0 development logs api-server"
        echo "  $0 development backup"
        echo "  $0 development restore /path/to/backup"
        exit 1
        ;;
esac

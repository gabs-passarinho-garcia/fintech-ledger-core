# ===========================================
# Fintech Ledger Core - Docker Compose Management
# ===========================================

.PHONY: help up down dev start build test lint db-migrate db-update db-init

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
CYAN=\033[0;36m
WHITE=\033[1;37m
NC=\033[0m # No Color

# ===========================================
# HELP
# ===========================================
help: ## Show this help message
	@echo "$(WHITE)Fintech Ledger Core - Management$(NC)"
	@echo "$(CYAN)===========================================$(NC)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ===========================================
# SETUP & INSTALLATION
# ===========================================
install: ## Install dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	bun install

# ===========================================
# DEVELOPMENT
# ===========================================
up: ## Start infrastructure services (PostgreSQL + LocalStack)
	@echo "$(BLUE)🚀 Starting infrastructure services...$(NC)"
	@echo "$(YELLOW)This will start:$(NC)"
	@echo "  • PostgreSQL Database"
	@echo "  • LocalStack (AWS Services)"
	@echo ""
	docker compose up -d
	@echo "$(GREEN)✅ Services started!$(NC)"

down: ## Stop all services
	@echo "$(YELLOW)🛑 Stopping all services...$(NC)"
	docker compose down
	@echo "$(GREEN)✅ All services stopped!$(NC)"

dev: ## Start application in development mode (with hot reload)
	@echo "$(BLUE)🔥 Starting application in development mode...$(NC)"
	@echo "$(YELLOW)📦 Ensuring infrastructure services are running...$(NC)"
	@docker compose up -d
	@echo "$(YELLOW)⏳ Waiting for services to be healthy...$(NC)"
	@timeout=60; \
	while [ $$timeout -gt 0 ]; do \
		postgres_health=$$(docker inspect ledger-core-postgres --format='{{.State.Health.Status}}' 2>/dev/null || echo ""); \
		localstack_health=$$(docker inspect ledger-core-localstack --format='{{.State.Health.Status}}' 2>/dev/null || echo ""); \
		if [ "$$postgres_health" = "healthy" ] && [ "$$localstack_health" = "healthy" ]; then \
			echo "$(GREEN)✅ All services are healthy!$(NC)"; \
			break; \
		fi; \
		echo "  • PostgreSQL: $$([ -n "$$postgres_health" ] && echo "$$postgres_health" || echo "starting...")"; \
		echo "  • LocalStack: $$([ -n "$$localstack_health" ] && echo "$$localstack_health" || echo "starting...")"; \
		sleep 2; \
		timeout=$$((timeout - 2)); \
	done; \
	if [ $$timeout -le 0 ]; then \
		echo "$(RED)❌ Timeout waiting for services to be healthy$(NC)"; \
		echo "$(YELLOW)Run 'make status' to check service status$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)📋 Copying .env to backend...$(NC)"
	@if [ -f .env ]; then \
		cp .env backend/.env; \
		echo "$(GREEN)✅ .env copied to backend$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  .env file not found in root$(NC)"; \
	fi
	@echo "$(YELLOW)Server will be available at:$(NC)"
	@echo "  • http://localhost:$${SERVER_PORT:-3000}"
	@echo "  • API Docs: http://localhost:$${SERVER_PORT:-3000}/docs"
	@echo ""
	bun --filter backend dev

start: build ## Start application in production mode (requires build)
	@echo "$(BLUE)🚀 Starting application in production mode...$(NC)"
	@echo "$(YELLOW)Server will be available at:$(NC)"
	@echo "  • http://localhost:$${SERVER_PORT:-3000}"
	@echo "  • API Docs: http://localhost:$${SERVER_PORT:-3000}/docs"
	@echo ""
	bun --filter backend prod

build: ## Build application for production
	@echo "$(BLUE)🔨 Building application...$(NC)"
	bun --filter backend build:prod
	@echo "$(GREEN)✅ Build completed!$(NC)"

# ===========================================
# DATABASE MANAGEMENT
# ===========================================
db-init: ## Generate Prisma client
	@echo "$(BLUE)🔧 Generating Prisma client...$(NC)"
	bun --filter backend db:init

db-update: ## Run Prisma migrate dev (create and apply migrations)
	@echo "$(BLUE)🔄 Running Prisma migrate dev...$(NC)"
	bun --filter backend db:update

db-migrate: ## Run Prisma migrations
	@echo "$(BLUE)🔄 Running Prisma migrations...$(NC)"
	bun --filter backend db:deploy

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)🎨 Opening Prisma Studio...$(NC)"
	bun --filter backend db:studio

# ===========================================
# TESTING & QUALITY
# ===========================================
test: ## Run tests
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	bun --filter backend test && bun --filter frontend test

lint: ## Run linting
	@echo "$(BLUE)🔍 Running linting...$(NC)"
	bun --filter backend lint && bun --filter frontend lint

check: ## Run all checks (lint + type)
	@echo "$(BLUE)✅ Running all checks...$(NC)"
	bun check

# ===========================================
# UTILITY COMMANDS
# ===========================================
status: ## Show status of all services
	@echo "$(BLUE)📊 Service Status:$(NC)"
	@echo ""
	docker compose ps


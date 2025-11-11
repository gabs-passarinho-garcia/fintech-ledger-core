# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development

```bash
# Install dependencies
bun install

# Start infrastructure (PostgreSQL + LocalStack)
make up

# Initialize Prisma client
bun db:init

# Run migrations
bun db:update

# Start development server with hot reload
bun dev

# Stop infrastructure
make down
```

### Testing

```bash
# Run all tests
bun test

# Run tests with coverage
bun test:cov

# Run type checking
bun check:type

# Run linting
bun lint

# Run all checks (lint + type)
bun check
```

### Database

```bash
# Open Prisma Studio (database GUI)
bun db:studio

# Create new migration (development)
bun db:migrate

# Deploy migrations (production)
bun db:deploy

# Generate Prisma client after schema changes
bun db:init
```

### Single Test Execution

```bash
# Run specific test file
bun test path/to/file.spec.ts

# Run tests matching a pattern
bun test --test-name-pattern "pattern"
```

## Architecture Overview

This is a **financial ledger engine** built with **Clean Architecture** and **Domain-Driven Design (DDD)** principles. The architecture enforces strict separation of concerns with dependency flow: `Infrastructure -> Presentation -> Service -> Domain`.

### Layer Responsibilities

**Domain Layer** (`src/modules/{module}/domain/`)
- Core business entities (`LedgerEntry`, `Account`) with encapsulated business logic
- Entities are NOT data bags - they contain behavior (e.g., `ledgerEntry.markAsCompleted()`)
- Zero external dependencies (no Prisma, Elysia, AWS SDK)
- All financial calculations use `Decimal.js` for precision
- Factories handle entity creation and reconstruction

**Repository Layer** (`src/modules/{module}/infra/repositories/`)
- Single Responsibility: one repository per operation type (Create, Get, Update)
- Accepts and returns Domain Entities
- Handles mapping between Domain and Prisma models
- All repositories accept optional `Prisma.TransactionClient` for atomic operations
- Pattern: `{Operation}{Entity}Repository` (e.g., `CreateLedgerEntryRepository`, `GetAccountRepository`)

**Service Layer** (`src/modules/{module}/usecases/`)
- Orchestrates business workflows
- All services implement `IService<TInput, TOutput>` interface
- Uses `TransactionManager` to ensure atomic operations
- Financial transactions (balance updates + ledger entry creation) MUST happen within a single database transaction
- After successful transactions, dispatches events to SQS for async processing

**Presentation Layer** (`src/modules/{module}/infra/controllers/`)
- HTTP endpoints using Elysia.js
- Validates input using TypeBox schemas
- Controllers structured as Elysia plugins with `prefix` option
- Uses `scopeResolver` for dependency injection
- Pattern: `{Module}Controller.ts` (e.g., `LedgerController`)

**Infrastructure Layer** (`src/common/providers/`)
- Only layer that communicates with external services
- Implements interfaces defined in `src/common/interfaces/` and `src/common/adapters/`
- Contains AWS SDK, Prisma handlers, Winston logger implementations
- All external dependencies live here

### Dependency Injection

- Uses **Awilix** container for DI
- Dependencies registered in modules: `ProvidersModule`, `{Module}Module`, `AppModule`
- Controllers use `scopeResolver` to resolve services per-request
- Container initialized in `app.ts` before any middleware execution

### Multi-Tenancy

- **Shared database, shared schema** approach with application-level isolation
- ALL database queries MUST include `tenantId` in the `where` clause
- `tenantId` extracted from request context (session, headers, or path parameters)
- Enforced at repository layer

### Atomic Transactions

- All financial operations use Prisma's `$transaction` via `ITransactionManager`
- Pattern: Repositories accept optional `tx: Prisma.TransactionClient` parameter
- Use case wraps operations in `transactionManager.runInTransaction()`
- Example flow: validate accounts → debit source → credit destination → create ledger entry (all atomic)

### Event-Driven Architecture

- After successful database transactions, events dispatched to AWS SQS
- Ensures eventual consistency without blocking main transaction
- SQS handler implements `IQueueProducer` interface

## Critical Rules

### TypeScript Strictness

- `strict` mode enabled - zero `any` types allowed
- Use specific types, interfaces, generics, or `unknown`
- This is non-negotiable for a financial system

### Bun Runtime

- Use `bun` for ALL operations (not Node.js, npm, pnpm, yarn)
- Test runner: `bun test` (uses `bun:test` API)
- Package manager: `bun install`
- Script execution: `bun run <script>`

### Code Quality

- All code must pass ESLint and Prettier before merge
- Tests MUST be written for Domain and Service layers (critical financial paths)
- Test files: `__tests__/{Name}.spec.ts` pattern
- Conventional Commits required: `feat:`, `fix:`, `chore:`, etc.

### Security & Observability

- Rate limiting configured per endpoint (see `src/common/middlewares/rateLimiting.ts`)
- Security headers: CSP, HSTS, X-Frame-Options (environment-based presets)
- Correlation ID tracking for request tracing
- Structured logging via Winston
- Distributed tracing via OpenTelemetry
- Error tracking via Sentry
- Performance monitoring via Server-Timing headers

## Module Structure

Each domain module follows this structure:

```
src/modules/{module}/
├── domain/          # Entities, Factories, Value Objects
├── usecases/        # Application services (business workflows)
├── infra/
│   ├── controllers/ # HTTP endpoints (Elysia plugins)
│   └── repositories/# Database operations (one per operation)
└── dtos/            # TypeBox validation schemas
```

## Important Patterns

### Service Interface

All services implement:

```typescript
export interface IService<TInput, TOutput> {
  execute(data: TInput): Promise<TOutput>;
}
```

### Repository Pattern

Repositories are focused and single-purpose:

- `CreateLedgerEntryRepository` - creates ledger entries
- `GetAccountRepository` - retrieves accounts
- `UpdateAccountBalanceRepository` - updates balances (debit/credit methods)

All accept optional `tx` parameter for transactions.

### Controller Pattern

```typescript
export const LedgerController = new Elysia({ prefix: '/ledger' })
  .resolve(scopeResolver)
  .post('/entries', handler, { detail: {...} });
```

### Transaction Pattern

```typescript
await transactionManager.runInTransaction(async (ctx) => {
  // All operations use ctx.prisma
  await repository.create({ ..., tx: ctx.prisma });
  await repository.update({ ..., tx: ctx.prisma });
});
```

## Infrastructure

### Local Development

- **PostgreSQL 16** on port 5432 (via Docker Compose)
- **LocalStack** on port 4566 (emulates SQS, Secrets Manager)
- Database: `ledger_core_db`, user: `ledger_user`

### Deployment

Infrastructure as Code using **OpenTofu** (Terraform-compatible):

```bash
cd terraform

# Initialize
tofu init -backend-config=environments/dev/backend.hcl

# Plan
tofu plan -var-file=environments/dev/terraform.tfvars

# Apply
tofu apply -var-file=environments/dev/terraform.tfvars
```

### Environment Variables

Copy `env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `APP_ENV` - DEVELOPMENT, STAGING, or PRODUCTION
- `CORS_ORIGIN` - Comma-separated allowed origins
- AWS credentials for SQS/Secrets Manager

## Common Gotchas

1. **Never use `any` type** - The linter will catch this, but it defeats TypeScript's purpose in a financial system
2. **Always use Decimal.js for money** - Never use JavaScript's Number for currency calculations
3. **Repositories are single-purpose** - Don't create generic repositories; create focused ones
4. **Transactions are mandatory for financial operations** - Balance updates must be atomic
5. **Always filter by tenantId** - Multi-tenancy isolation is at the application layer
6. **Test critical paths** - Domain and Service layers must have comprehensive test coverage
7. **Controllers use scopeResolver** - Don't resolve dependencies directly; use the DI pattern shown in existing controllers
8. **Entities validate themselves** - Domain entities call `validate()` in their `create()` method

## Philosophy

This project demonstrates excellence in software architecture for financial systems. Every decision prioritizes:

- **Security** - Type safety, input validation, rate limiting
- **Accuracy** - Decimal precision, atomic transactions, ACID compliance
- **Auditability** - Structured logging, distributed tracing, correlation IDs
- **Maintainability** - Clean Architecture, DDD, dependency injection
- **Reliability** - Event-driven architecture, comprehensive testing

When in doubt, prioritize these principles over convenience.

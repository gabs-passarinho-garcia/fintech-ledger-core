# Fintech Ledger Core 💰

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3.2-orange.svg)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Elysia-1.4.11-green.svg)](https://elysiajs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-purple.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![CI](https://github.com/yourusername/fintech-ledger-core/workflows/CI/badge.svg)](https://github.com/yourusername/fintech-ledger-core/actions)

> High-performance financial ledger engine focused on atomic consistency and decoupled architecture

## 🎯 Overview

Fintech Ledger Core is a demonstration project showcasing enterprise-level software architecture and engineering practices. It implements a financial ledger system with **atomic transaction support**, **event-driven architecture**, and **clean separation of concerns**.

### Key Features

- 🏗️ **Clean Architecture** - Domain-driven design with clear separation of concerns
- 🔒 **Type Safety** - 100% TypeScript with strict type checking (zero `any` types)
- 🚀 **High Performance** - Built on Bun runtime for optimal speed
- ⚡ **Atomic Transactions** - ACID-compliant database operations using Prisma transactions
- 🔄 **Event-Driven** - Asynchronous event processing via AWS SQS
- 🏛️ **Multi-Tenant** - Tenant isolation at the application layer
- 📊 **Database Management** - Prisma ORM with PostgreSQL
- 🧪 **Comprehensive Testing** - Unit tests with Bun test runner
- 📝 **API Documentation** - Auto-generated Swagger/OpenAPI docs
- 🌐 **Infrastructure as Code** - OpenTofu (Terraform alternative) for AWS deployment

## 🏛️ Architecture

The project follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
│              (Controllers, Routers, DTOs)                  │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                          │
│            (Use Cases, Business Logic)                      │
├─────────────────────────────────────────────────────────────┤
│                   Repository Layer                         │
│              (Data Access, Persistence)                    │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                           │
│            (Entities, Factories, Business Rules)           │
└─────────────────────────────────────────────────────────────┘
```

### Flow Direction

**Controller → Use Case → Repository → Domain**

- **Domain Layer**: Core business entities and rules (LedgerEntry, Account)
- **Repository Layer**: Data persistence and retrieval
- **Service Layer**: Business workflows and orchestration
- **Presentation Layer**: HTTP endpoints and request/response handling

## 🛠️ Tech Stack

### Core Technologies

- **Runtime**: [Bun](https://bun.sh/) - Ultra-fast JavaScript runtime
- **Framework**: [Elysia.js](https://elysiajs.com/) - Ergonomic web framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)

### Infrastructure & DevOps

- **Infrastructure as Code**: [OpenTofu](https://opentofu.org/) (Terraform alternative)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Cloud Provider**: Amazon Web Services (AWS)

### Development Tools

- **Dependency Injection**: [Awilix](https://github.com/jeffijoe/awilix)
- **Validation**: [TypeBox](https://github.com/sinclairzx81/typebox)
- **Testing**: Bun Test Runner
- **Linting**: ESLint + Prettier
- **Logging**: Winston

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3.0
- [PostgreSQL](https://www.postgresql.org/) >= 16
- [Docker](https://www.docker.com/) (optional, for LocalStack)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fintech-ledger-core.git
   cd fintech-ledger-core
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure**
   ```bash
   make up
   ```

5. **Database setup**
   ```bash
   bun db:init
   bun db:update
   ```

6. **Start development server**
   ```bash
   bun dev
   ```

   The API will be available at `http://localhost:3000`

## 📚 API Documentation

API documentation is automatically generated using Swagger/OpenAPI:

- **Development**: `http://localhost:3000/docs`
- **Root Endpoint**: Visit the root path `/` for general API information

## 🧪 Testing

```bash
# Run all tests
bun test

# Run tests with coverage
bun test:cov

# Run type checking
bun check:type

# Run linting
bun lint

# Run all checks
bun check
```

## 🏗️ Architecture Decision Records (ADRs)

### Why Bun?

Bun provides superior performance compared to Node.js, with:
- Faster startup times
- Built-in test runner
- Native TypeScript support
- Integrated package manager
- Better memory efficiency

This makes it ideal for high-performance financial systems where latency matters.

### Why Clean Architecture?

Clean Architecture ensures that business rules are **completely independent** of:
- Frameworks (Elysia, Prisma)
- External libraries (AWS SDK)
- UI/API layers
- Database implementations

This independence allows the system to:
- Switch frameworks without changing business logic
- Test business rules in isolation
- Maintain long-term flexibility
- Scale with confidence

### Why OpenTofu instead of Terraform?

**OpenTofu** is a fork of Terraform that maintains 100% compatibility with Terraform's language and state format, but with key advantages:

1. **Open Source Governance**: OpenTofu is governed by the Linux Foundation, ensuring true open-source development without vendor lock-in
2. **Community-Driven**: Decisions are made by the community, not a single vendor
3. **License Clarity**: Uses MPL 2.0 license, providing clearer licensing terms
4. **Future-Proof**: Ensures the tool remains open and community-controlled
5. **Same Syntax**: 100% compatible with Terraform, so existing knowledge and modules work seamlessly

For a financial system, having infrastructure code that is truly open-source and community-controlled provides better long-term security and maintainability.

### Why Infrastructure as Code?

Infrastructure should be:
- **Versioned** - Track changes over time
- **Auditable** - Review infrastructure changes like code
- **Reproducible** - Deploy identical environments
- **Testable** - Validate infrastructure before deployment

IaC ensures infrastructure changes are deliberate, reviewed, and reversible.

## 📁 Project Structure

```
fintech-ledger-core/
├── .github/workflows/    # CI/CD pipelines
├── terraform/             # Infrastructure as Code (OpenTofu)
│   ├── modules/          # Reusable modules (RDS, SQS)
│   └── environments/     # Environment-specific configs
├── src/
│   ├── common/           # Shared utilities
│   │   ├── adapters/    # Interfaces (ILogger, IQueueProducer)
│   │   ├── container/    # Dependency injection
│   │   ├── errors/       # Custom error classes
│   │   ├── providers/    # Implementations (Prisma, SQS, Logger)
│   │   └── enums/        # Shared enumerations
│   ├── modules/          # Domain modules (Vertical Slices)
│   │   └── ledger/
│   │       ├── domain/   # Entities and factories
│   │       ├── usecases/ # Business logic
│   │       ├── infra/    # Repositories and controllers
│   │       └── dtos/     # Data transfer objects
│   ├── app.ts            # Application setup
│   └── server.ts         # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── docker-compose.yml     # Local development environment
├── Makefile              # Development commands
└── README.md
```

## 🔄 Development Workflow

```bash
# Start infrastructure
make up

# Run database migrations
make db-update

# Start development server
bun dev

# Run tests
make test

# Run all checks
make check
```

## 🚀 Deployment

### Using OpenTofu

```bash
cd terraform

# Initialize OpenTofu
tofu init -backend-config=environments/dev/backend.hcl

# Plan deployment
tofu plan -var-file=environments/dev/terraform.tfvars

# Apply changes
tofu apply -var-file=environments/dev/terraform.tfvars
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the coding standards: Run `bun check` before committing
4. Write tests: Ensure your changes are covered by tests
5. Commit using Conventional Commits: `feat: add amazing feature`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the GNU General Public License v3.0 (GPLv3) - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with excellence and attention to detail
- Powered by the amazing Bun runtime
- Inspired by Clean Architecture principles
- Guided by Domain-Driven Design practices

---

**Happy Coding!** 🎉

For questions or support, please open an issue on [GitHub](https://github.com/yourusername/fintech-ledger-core/issues).

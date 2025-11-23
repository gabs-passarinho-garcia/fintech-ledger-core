# Fintech Ledger Core - Frontend

Frontend application for Fintech Ledger Core built with React, Vite, Bun, and Tailwind CSS.

## Features

- 🔐 Complete authentication system (sign in, sign up, token refresh)
- 👤 User profile management (view, edit, create, select)
- 🏛️ Master/admin management (users, profiles, tenants, ledgers)
- 💰 Full ledger entry CRUD operations (create, read, update, delete, list)
- 💳 Account management (view, create, list accounts by profile)
- 🏢 Tenant management (list tenants, admin management)
- 📊 Dashboard with statistics, charts, and filtered ledger entries
- 🔗 Correlation ID synchronization for frontend/backend logs
- 🎨 Modern, responsive UI with Tailwind CSS
- 🌓 Theme support (light/dark mode)
- 🧪 Unit tests with Bun test and React Testing Library

## Tech Stack

- **Runtime & Bundler**: Bun 1.3.3
- **Framework**: React 18.3.1
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 6.26.1
- **API Client**: Elysia Eden Treaty 1.4.5 (type-safe API client)
- **Styling**: Tailwind CSS 3.4.10
- **Testing**: Bun Test + React Testing Library
- **Type Safety**: TypeScript 5.9.3

## Getting Started

### Prerequisites

- Bun >= 1.3.3

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
bun build
```

### Preview Production Build

```bash
# Preview production build
bun preview
```

### Testing

```bash
# Run tests
bun test

# Run tests with coverage
bun test:cov

# Run tests in watch mode
bun test:watch
```

### Code Quality

```bash
# Type check
bun type-check

# Lint
bun lint

# Format
bun format

# Run all checks
bun check
```

## Project Structure

```text
frontend/
├── src/
│   ├── api/              # Eden Treaty client and endpoints
│   ├── components/       # Reusable React components
│   │   ├── __tests__/   # Component tests
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Layout.tsx
│   │   ├── Loading.tsx
│   │   ├── Modal.tsx
│   │   ├── Pagination.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SimpleChart.tsx
│   │   ├── StatsCard.tsx
│   │   ├── Table.tsx
│   │   └── Toast.tsx
│   ├── contexts/         # React contexts (Theme, etc.)
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCorrelationId.ts
│   │   ├── useTheme.ts
│   │   └── useToast.ts
│   ├── pages/            # Page components
│   │   ├── AccountsManagement.tsx
│   │   ├── CreateProfile.tsx
│   │   ├── Dashboard.tsx
│   │   ├── LedgerEntryCreate.tsx
│   │   ├── LedgerEntryDetail.tsx
│   │   ├── LedgerEntryEdit.tsx
│   │   ├── LedgersManagement.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   ├── ProfileEdit.tsx
│   │   ├── ProfileSelection.tsx
│   │   ├── ProfilesManagement.tsx
│   │   ├── Signup.tsx
│   │   ├── TenantsList.tsx
│   │   ├── TenantsManagement.tsx
│   │   └── UsersManagement.tsx
│   ├── services/         # Business logic services
│   │   ├── accounts.ts
│   │   ├── auth.ts
│   │   ├── ledger.ts
│   │   ├── profile.ts
│   │   ├── tenants.ts
│   │   └── users.ts
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── test/             # Test setup
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── scripts/              # Build and dev scripts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── bunfig.toml
```

## Pages and Routes

- `/login` - User authentication (sign in)
- `/signup` - User registration
- `/dashboard` - Main dashboard with stats, charts, and ledger entries
- `/profile` - View current user profile
- `/profile/edit` - Edit current user profile
- `/profile/create` - Create new profile
- `/profile-selection` - Select active profile (multi-profile support)
- `/accounts` - Account management (view and create accounts)
- `/tenants` - List available tenants
- `/admin/tenants` - Admin tenant management (master users only)
- `/admin/ledgers` - Admin ledger management (master users only)
- `/users` - User management (master users only)
- `/profiles` - Profile management (master users only)

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## API Integration

The frontend uses Elysia Eden Treaty for type-safe API communication. The client automatically:

- Adds correlation ID to all requests
- Adds authorization tokens
- Handles token refresh on 401 errors
- Provides end-to-end type safety from backend to frontend

### Available API Endpoints

The frontend integrates with the following backend endpoints:

- **Authentication** (`/auth`) - Sign in, sign up, refresh token
- **Users** (`/users`) - User and profile management
- **Ledger** (`/ledger`) - Ledger entry CRUD operations
- **Tenants** (`/tenants`) - Tenant listing and management
- **Accounts** (`/accounts`) - Account management

## Correlation ID

The frontend implements correlation ID tracking to synchronize logs between frontend and backend. The correlation ID is:

- Generated using uuidv7
- Stored in sessionStorage
- Automatically added to all API requests via `X-Correlation-ID` header
- Reset on new sessions
- Used for distributed tracing across frontend and backend

## Authentication Flow

1. User signs in via `/login` or signs up via `/signup`
2. Access token and refresh token are stored in localStorage
3. All API requests include the access token in the `Authorization` header
4. On 401 errors, the refresh token is used to obtain a new access token
5. If refresh fails, user is redirected to login
6. Master users can impersonate other users for admin operations

## Multi-Profile Support

Users can have multiple profiles across different tenants:

- Users can create multiple profiles
- Profile selection page allows switching between profiles
- Each profile has its own accounts and ledger entries
- Profile context is maintained in the session

## License

GPL-3.0-or-later

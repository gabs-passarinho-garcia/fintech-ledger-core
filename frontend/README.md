# Fintech Ledger Core - Frontend

Frontend application for Fintech Ledger Core built with React, Vite, Bun, and Tailwind CSS.

## Features

- 🔐 Complete authentication system (sign in, sign up, token refresh)
- 👤 User profile management
- 🏛️ Master/admin management (users and profiles)
- 💰 Full ledger entry CRUD operations
- 🔗 Correlation ID synchronization for frontend/backend logs
- 🎨 Modern, responsive UI with Tailwind CSS
- 🧪 Unit tests with Bun test and React Testing Library

## Tech Stack

- **Runtime & Bundler**: Bun
- **Framework**: React 18
- **Routing**: React Router DOM
- **API Client**: Elysia Eden Treaty
- **Styling**: Tailwind CSS
- **Testing**: Bun Test + React Testing Library

## Getting Started

### Prerequisites

- Bun >= 1.3.2

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

```
frontend/
├── src/
│   ├── api/              # Eden Treaty client and endpoints
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── test/             # Test setup
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── scripts/              # Build and dev scripts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── bunfig.toml
```

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

## Correlation ID

The frontend implements correlation ID tracking to synchronize logs between frontend and backend. The correlation ID is:

- Generated using uuidv7
- Stored in sessionStorage
- Automatically added to all API requests
- Reset on new sessions

## License

GPL-3.0-or-later


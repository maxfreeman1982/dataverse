# DataVerse OS

**DataVerse OS** - Unified Sovereign Workspace Platform

A modular, intelligent, and secure ecosystem combining no-code tools, databases, collaboration, communication, and AI.

## 📋 Project Status

🚧 **In Development** - Initial MVP Phase

### Current Features
- ✅ Backend API (NestJS + GraphQL)
- ✅ Authentication (JWT)
- ✅ User Management
- ✅ Database Studio (Schema Management)
- ⏳ Frontend (Next.js) - Coming soon
- ⏳ Real-time Communication - Coming soon
- ⏳ AI Integration - Coming soon

## 🏗️ Architecture

```
dataverse/
├── apps/
│   ├── api/          # Backend API (NestJS + GraphQL)
│   └── web/          # Frontend (Next.js) - Coming soon
├── packages/
│   ├── database/     # Database utilities
│   ├── auth/         # Authentication module
│   ├── shared/       # Shared types
│   └── ui/           # UI components
├── docker/           # Docker configurations
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dataverse
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start infrastructure services**
```bash
docker-compose -f docker/docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (port 9000, console 9001)
- Meilisearch (port 7700)
- Adminer (port 8080) - Database UI

5. **Start the API**
```bash
cd apps/api
pnpm install
pnpm run dev
```

The API will be available at:
- REST API: http://localhost:3001/api/v1
- GraphQL: http://localhost:3001/graphql
- Health: http://localhost:3001/api/v1/health

## 📚 API Documentation

### GraphQL Playground

Visit http://localhost:3001/graphql to access the GraphQL Playground.

### Example Queries

**Register a new user:**
```graphql
mutation {
  register(
    email: "user@example.com"
    password: "securepassword"
    firstName: "John"
    lastName: "Doe"
  ) {
    accessToken
    user {
      id
      email
      fullName
    }
  }
}
```

**Login:**
```graphql
mutation {
  login(
    email: "user@example.com"
    password: "securepassword"
  ) {
    accessToken
    user {
      id
      email
      fullName
    }
  }
}
```

**Create a database table:**
```graphql
mutation {
  createDatabaseTable(
    userId: "your-user-id"
    input: {
      name: "Customers"
      slug: "customers"
      description: "Customer database"
      columns: [
        {
          name: "Name"
          slug: "name"
          type: TEXT
          isRequired: true
        }
        {
          name: "Email"
          slug: "email"
          type: EMAIL
          isRequired: true
          isUnique: true
        }
        {
          name: "Phone"
          slug: "phone"
          type: PHONE
        }
      ]
    }
  ) {
    id
    name
    slug
    columns {
      id
      name
      type
    }
  }
}
```

**Get all tables:**
```graphql
query {
  databaseTables {
    id
    name
    slug
    description
    columns {
      id
      name
      type
      isRequired
    }
  }
}
```

## 🛠️ Development

### Project Structure

**Backend (apps/api):**
- `src/modules/auth/` - Authentication & JWT
- `src/modules/users/` - User management
- `src/modules/database/` - Database Studio (table schema management)
- `src/modules/health/` - Health checks
- `src/common/` - Shared utilities (guards, decorators, etc.)

### Tech Stack

**Backend:**
- NestJS - Framework
- TypeORM - ORM
- PostgreSQL - Primary database
- GraphQL (Apollo) - API layer
- JWT - Authentication
- Redis - Cache & sessions

**Infrastructure:**
- Docker - Containerization
- MinIO - Object storage (S3-compatible)
- Meilisearch - Search engine

### Available Scripts

```bash
# Install dependencies
pnpm install

# Development
pnpm run dev              # Start all apps in dev mode
cd apps/api && pnpm dev   # Start API only

# Build
pnpm run build            # Build all apps

# Test
pnpm run test             # Run tests

# Lint
pnpm run lint             # Lint code
pnpm run format           # Format code

# Docker
pnpm run docker:dev       # Start dev infrastructure
```

## 🗄️ Database

### Access Database UI

- **Adminer**: http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: dataverse
  - Password: dataverse
  - Database: dataverse

### Schema

The application uses TypeORM with automatic migrations in development mode.

Main tables:
- `users` - User accounts
- `database_tables` - Dynamic table schemas
- `database_columns` - Dynamic column definitions

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- GraphQL authentication guards

## 📖 Documentation

See [DATAVERSE_OS_ARCHITECTURE.md](./DATAVERSE_OS_ARCHITECTURE.md) for complete architecture documentation.

## 🎯 Roadmap

### Phase 1 (Current) - Foundation
- [x] Project structure (Monorepo)
- [x] Backend API (NestJS)
- [x] Authentication (JWT)
- [x] User management
- [x] Database Studio schema management
- [ ] Frontend (Next.js)
- [ ] Real-time sync (Socket.io)

### Phase 2 - Core Features
- [ ] No-Code Builder
- [ ] AI Copilot integration
- [ ] Communication module (chat, video)
- [ ] Suite bureautique (docs, spreadsheet)
- [ ] Mail AI

### Phase 3 - Advanced Features
- [ ] Workflow automation
- [ ] MCP (Model Context Protocol) integration
- [ ] Mobile apps
- [ ] Marketplace

## 🤝 Contributing

This project is currently in early development. Contribution guidelines will be available soon.

## 📝 License

Proprietary - All rights reserved

## 🔗 Links

- Documentation: [Architecture](./DATAVERSE_OS_ARCHITECTURE.md)
- Issues: [GitHub Issues](https://github.com/your-org/dataverse/issues)

---

**Built with ❤️ for sovereign and intelligent workspaces**

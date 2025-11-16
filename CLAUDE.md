# CLAUDE.md - DataVerse OS Developer Guide for AI Assistants

**Version:** 1.0
**Last Updated:** 2025-11-16
**Purpose:** Comprehensive guide for AI assistants working on the DataVerse OS codebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Structure](#architecture--structure)
3. [Technology Stack](#technology-stack)
4. [Development Setup](#development-setup)
5. [Codebase Organization](#codebase-organization)
6. [Coding Conventions](#coding-conventions)
7. [Common Workflows](#common-workflows)
8. [Key Patterns](#key-patterns)
9. [Testing Guidelines](#testing-guidelines)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

**DataVerse OS** is a unified sovereign workspace platform that combines:
- **No-code/low-code tools** for building custom applications
- **Database Studio** with dynamic schema management
- **AI integration** (OpenAI GPT-4, RAG, embeddings)
- **Real-time collaboration** (WebSocket, Socket.IO)
- **Communication tools** (chat, video calls, email)
- **Office suite** (documents, spreadsheets, presentations)
- **Workflow automation** (visual builder, triggers, actions)
- **MCP integration** (Model Context Protocol for AI extensibility)

**Goal:** Replace 20+ SaaS tools with a single, cohesive, sovereign platform.

---

## Architecture & Structure

### Monorepo Layout

```
dataverse/
├── apps/
│   ├── api/              # Backend (NestJS + GraphQL + TypeORM)
│   └── web/              # Frontend (Next.js + React + Tailwind)
├── packages/             # Shared packages (planned but not yet implemented)
│   ├── shared/           # Shared types and utilities
│   ├── database/         # Database utilities
│   └── auth/             # Authentication modules
├── docker/               # Docker Compose configurations
├── .env.example          # Environment variables template
├── package.json          # Root package.json with workspace scripts
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── turbo.json            # Turborepo build configuration
├── tsconfig.json         # Base TypeScript configuration
├── README.md             # User-facing documentation
└── DATAVERSE_OS_ARCHITECTURE.md  # Detailed architecture docs
```

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  • Dashboard • Database Studio • Chat • Mail • Office       │
│  • Builder • Workflows • Video • AI Command Bar             │
└────────────────────┬────────────────────────────────────────┘
                     │ GraphQL + WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                    Backend (NestJS)                          │
│  • Auth • Users • Database • AI • Builder • Chat            │
│  • Mail • Office • Video • Workflow • MCP • WebSocket       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Infrastructure                            │
│  • PostgreSQL (primary DB) • Redis (cache)                  │
│  • MinIO (object storage) • Meilisearch (search)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend (`apps/api`)

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | NestJS | 10.3.x |
| Language | TypeScript | 5.3.x |
| Database | PostgreSQL | 16+ |
| ORM | TypeORM | 0.3.17 |
| API Layer | GraphQL (Apollo Server) | 4.9.x |
| Authentication | JWT (passport-jwt) | Latest |
| Real-time | Socket.IO | 4.6.x |
| AI | OpenAI API | 4.20.x |
| Validation | class-validator, class-transformer | Latest |
| Cache | Redis | 7.x |

### Frontend (`apps/web`)

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.3.x |
| UI Library | React | 18.x |
| Styling | Tailwind CSS | 3.4.x |
| Components | Shadcn/ui | Latest |
| GraphQL Client | Apollo Client | 3.8.x |
| State Management | Zustand | 4.4.x |
| Real-time | Socket.IO Client | 4.6.x |
| Icons | Lucide React | Latest |
| Command Palette | cmdk | Latest |

### Infrastructure

- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching and pub/sub
- **MinIO** - S3-compatible object storage
- **Meilisearch** - Full-text search engine
- **Docker & Docker Compose** - Containerization

### Build Tools

- **pnpm** - Package manager (v8.11.0)
- **Turbo** - Monorepo build system (v1.11.0)
- **TypeScript** - Type safety throughout
- **Prettier** - Code formatting
- **ESLint** - Code linting

---

## Development Setup

### Prerequisites

- **Node.js** 20+ (required by engines)
- **pnpm** 8+ (required by engines)
- **Docker** and **Docker Compose** (for infrastructure services)
- **Git** (for version control)

### Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd dataverse

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY and other secrets

# 4. Start infrastructure services (PostgreSQL, Redis, MinIO, etc.)
docker-compose -f docker/docker-compose.dev.yml up -d

# 5. Start the API (in one terminal)
cd apps/api
pnpm dev
# API will be at http://localhost:3001

# 6. Start the Frontend (in another terminal)
cd apps/web
pnpm dev
# Frontend will be at http://localhost:3000
```

### Environment Variables

**Critical variables** (see `.env.example` for full list):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dataverse
DB_PASSWORD=dataverse
DB_DATABASE=dataverse

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI (REQUIRED for AI features)
OPENAI_API_KEY=sk-your-api-key-here

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
```

### Available Scripts

**Root level:**
```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps for production
pnpm test         # Run all tests
pnpm lint         # Lint all code
pnpm format       # Format code with Prettier
pnpm clean        # Clean all build artifacts and node_modules
pnpm docker:dev   # Start infrastructure services
pnpm docker:prod  # Start production infrastructure
```

**API (`apps/api`):**
```bash
pnpm dev          # Start API in watch mode
pnpm build        # Build for production
pnpm start:prod   # Run production build
pnpm test         # Run Jest tests
pnpm test:watch   # Run tests in watch mode
pnpm test:cov     # Generate coverage report
```

**Web (`apps/web`):**
```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Build for production
pnpm start        # Serve production build
pnpm lint         # Lint frontend code
```

---

## Codebase Organization

### Backend Structure (`apps/api/src`)

```
apps/api/src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root NestJS module
│
├── modules/                   # Feature modules
│   ├── auth/                  # Authentication (JWT, login, register)
│   │   ├── dto/               # GraphQL inputs/outputs
│   │   ├── entities/          # User entity
│   │   ├── auth.service.ts    # Business logic
│   │   ├── auth.resolver.ts   # GraphQL resolver
│   │   └── auth.module.ts     # Module definition
│   │
│   ├── users/                 # User management
│   ├── database/              # Dynamic database studio
│   │   ├── database-table.entity.ts
│   │   ├── database-column.entity.ts
│   │   └── database-record/ (dynamic CRUD)
│   │
│   ├── ai/                    # AI assistant with RAG
│   ├── builder/               # No-code page builder
│   ├── chat/                  # Real-time messaging
│   ├── mail/                  # Intelligent email
│   ├── office/                # Office suite (docs, sheets, slides)
│   ├── video/                 # WebRTC video calls
│   ├── workflow/              # Workflow automation
│   ├── mcp/                   # Model Context Protocol
│   ├── marketplace/           # Plugin marketplace
│   ├── mobile/                # Mobile app management
│   ├── websocket/             # WebSocket gateway
│   └── health/                # Health checks
│
└── common/                    # Shared utilities
    ├── decorators/            # @CurrentUser, etc.
    ├── guards/                # GqlAuthGuard, JwtAuthGuard
    └── filters/               # Exception filters
```

### Frontend Structure (`apps/web/src`)

```
apps/web/src/
├── app/                       # Next.js App Router pages
│   ├── page.tsx               # Landing page (/)
│   ├── auth/                  # Authentication pages
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/             # Main application
│   │   ├── layout.tsx         # Dashboard layout with nav
│   │   ├── page.tsx           # Dashboard home
│   │   ├── ai/                # AI assistant
│   │   ├── builder/           # Page builder
│   │   ├── chat/              # Messaging
│   │   ├── mail/              # Email client
│   │   ├── office/            # Office suite
│   │   │   ├── docs/[id]/
│   │   │   ├── sheets/[id]/
│   │   │   └── slides/[id]/
│   │   ├── video/[callId]/    # Video calls
│   │   ├── workflows/         # Workflow builder
│   │   ├── mcp/               # MCP management
│   │   ├── mobile/            # Mobile builder
│   │   └── marketplace/       # Plugin marketplace
│   │
│   ├── database/              # Database studio
│   │   └── [tableId]/         # Table view/editor
│   │
│   └── p/[slug]/              # Public published pages
│
├── components/                # React components
│   ├── ui/                    # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── builder/               # Builder-specific components
│   ├── dashboard/             # Dashboard components
│   ├── database/              # Database UI components
│   ├── providers.tsx          # Apollo Provider wrapper
│   └── command-bar.tsx        # AI Command Bar (Cmd+K)
│
├── graphql/                   # GraphQL queries/mutations
│   ├── builder.ts
│   ├── chat.ts
│   ├── enhanced-ai.ts
│   ├── mail.ts
│   ├── office.ts
│   ├── workflow.ts
│   └── ...
│
├── hooks/                     # Custom React hooks
│   ├── use-auth.ts            # Authentication hook
│   ├── use-websocket.ts       # WebSocket connection
│   ├── use-webrtc.ts          # Video calls
│   └── ...
│
├── store/                     # State management (Zustand)
│   └── auth-store.ts          # Auth state with persistence
│
├── lib/                       # Utilities
│   ├── apollo-client.ts       # Apollo Client setup
│   └── utils.ts               # Helper functions
│
└── types/                     # TypeScript type definitions
```

---

## Coding Conventions

### General Principles

1. **Type Safety First** - Use TypeScript strictly, avoid `any`
2. **Code-First GraphQL** - Use decorators for schema generation
3. **Modular Architecture** - Each feature is a self-contained module
4. **Consistent Naming** - Follow established patterns (see below)
5. **Documentation** - Add JSDoc comments for complex logic
6. **Error Handling** - Always handle errors gracefully

### Naming Conventions

#### Files & Folders

```
user.entity.ts           # TypeORM entity
user.resolver.ts         # GraphQL resolver
user.service.ts          # Business logic service
user.module.ts           # NestJS module
create-user.dto.ts       # Data transfer object
user-role.enum.ts        # Enumerations
gql-auth.guard.ts        # Guards
current-user.decorator.ts # Decorators
```

#### Database Columns

- **Database columns:** `snake_case` (e.g., `created_by_id`, `first_name`)
- **TypeScript properties:** `camelCase` (e.g., `createdById`, `firstName`)
- **Use `@Column({ name: 'snake_case' })` for mapping**

Example:
```typescript
@Entity('users')
export class User {
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'created_at' })
  createdAt: Date;
}
```

#### GraphQL Types

- **Object Types:** PascalCase (e.g., `User`, `DatabaseTable`)
- **Input Types:** PascalCase + "Input" suffix (e.g., `CreateUserInput`)
- **Fields:** camelCase (e.g., `firstName`, `isActive`)

### Entity Pattern (TypeORM + GraphQL)

**Dual decorators** for both TypeORM and GraphQL:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()  // GraphQL type
@Entity('users')  // Database table
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column({ name: 'first_name' })
  firstName: string;

  @Field()
  @Column({ name: 'last_name' })
  lastName: string;

  // Password is NOT exposed in GraphQL
  @Column()
  password: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**Key patterns:**
- UUIDs for primary keys (`@PrimaryGeneratedColumn('uuid')`)
- `snake_case` for DB columns, `camelCase` for TS properties
- Auto-managed timestamps: `@CreateDateColumn`, `@UpdateDateColumn`
- Sensitive fields (passwords) should NOT have `@Field()` decorator
- Use `simple-json` for JSON columns (SQLite/PostgreSQL compatible)
- Use `simple-enum` for enum columns (SQLite/PostgreSQL compatible)

### DTO Pattern (GraphQL Inputs/Outputs)

```typescript
import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// Input for mutations
@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsNotEmpty()
  lastName: string;
}

// Output for mutations/queries
@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
```

**Validation rules:**
- Use `class-validator` decorators (`@IsEmail`, `@MinLength`, etc.)
- Always validate inputs in DTOs
- Keep validation logic in DTOs, not services

### Service Pattern (Business Logic)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterInput } from './dto/register.input';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const user = this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    await this.userRepository.save(user);

    // Generate JWT
    const accessToken = this.jwtService.sign({ sub: user.id });

    return { accessToken, user };
  }
}
```

**Service conventions:**
- One service per module
- Inject repositories via `@InjectRepository`
- Business logic ONLY (no HTTP/GraphQL concerns)
- Return domain objects, not HTTP responses
- Use transactions for multi-step operations

### Resolver Pattern (GraphQL)

```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { AuthPayload } from './dto/auth-payload';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  // Public mutation
  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  // Protected query
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.authService.getCurrentUser(user.id);
  }
}
```

**Resolver conventions:**
- One resolver per entity
- Use `@UseGuards(GqlAuthGuard)` for protected routes
- Extract current user with `@CurrentUser()` decorator
- Keep resolvers thin - delegate to services
- Use `@Args()` for input arguments

### Module Pattern (NestJS)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
```

**Module structure:**
```
module/
├── dto/                # GraphQL inputs/outputs
│   ├── create-entity.input.ts
│   └── update-entity.input.ts
├── entities/           # TypeORM entities
│   └── entity.entity.ts
├── module.service.ts   # Business logic
├── module.resolver.ts  # GraphQL resolver
└── module.module.ts    # NestJS module
```

### Frontend Patterns

#### React Components

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </Button>
    </form>
  );
}
```

**Component conventions:**
- Use `'use client'` for client components
- TypeScript interfaces for props
- Extract reusable UI to `components/ui/`
- Use Shadcn/ui components for consistency
- Handle loading and error states

#### GraphQL Queries

```typescript
import { gql, useQuery, useMutation } from '@apollo/client';

// Define query
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      firstName
      lastName
      createdAt
    }
  }
`;

// Define mutation
export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      firstName
      lastName
    }
  }
`;

// Usage in component
function UsersPage() {
  const { data, loading, error } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.users.map(user => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}
```

#### Custom Hooks

```typescript
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(url: string, token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(url, {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url, token]);

  return socket;
}
```

---

## Common Workflows

### 1. Adding a New Feature Module

**Steps:**

1. **Create module structure**
```bash
cd apps/api/src/modules
mkdir my-feature
cd my-feature
mkdir dto entities
```

2. **Create entity**
```typescript
// my-feature/entities/my-feature.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('my_features')
export class MyFeature {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ name: 'created_at' })
  createdAt: Date;
}
```

3. **Create DTOs**
```typescript
// my-feature/dto/create-my-feature.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateMyFeatureInput {
  @Field()
  @IsNotEmpty()
  name: string;
}
```

4. **Create service**
```typescript
// my-feature/my-feature.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MyFeature } from './entities/my-feature.entity';

@Injectable()
export class MyFeatureService {
  constructor(
    @InjectRepository(MyFeature)
    private readonly myFeatureRepository: Repository<MyFeature>,
  ) {}

  async create(input: CreateMyFeatureInput): Promise<MyFeature> {
    const feature = this.myFeatureRepository.create(input);
    return this.myFeatureRepository.save(feature);
  }
}
```

5. **Create resolver**
```typescript
// my-feature/my-feature.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MyFeature } from './entities/my-feature.entity';
import { MyFeatureService } from './my-feature.service';
import { CreateMyFeatureInput } from './dto/create-my-feature.input';

@Resolver(() => MyFeature)
export class MyFeatureResolver {
  constructor(private readonly myFeatureService: MyFeatureService) {}

  @Mutation(() => MyFeature)
  async createMyFeature(@Args('input') input: CreateMyFeatureInput) {
    return this.myFeatureService.create(input);
  }
}
```

6. **Create module**
```typescript
// my-feature/my-feature.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyFeature } from './entities/my-feature.entity';
import { MyFeatureService } from './my-feature.service';
import { MyFeatureResolver } from './my-feature.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([MyFeature])],
  providers: [MyFeatureService, MyFeatureResolver],
  exports: [MyFeatureService],
})
export class MyFeatureModule {}
```

7. **Register in app.module.ts**
```typescript
import { MyFeatureModule } from './modules/my-feature/my-feature.module';

@Module({
  imports: [
    // ... other modules
    MyFeatureModule,
  ],
})
export class AppModule {}
```

### 2. Adding a New Frontend Page

**Steps:**

1. **Create page directory**
```bash
cd apps/web/src/app/dashboard
mkdir my-page
```

2. **Create page component**
```typescript
// apps/web/src/app/dashboard/my-page/page.tsx
'use client';

import { useQuery } from '@apollo/client';
import { GET_MY_FEATURES } from '@/graphql/my-feature';

export default function MyPage() {
  const { data, loading, error } = useQuery(GET_MY_FEATURES);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>My Features</h1>
      {/* Render data */}
    </div>
  );
}
```

3. **Create GraphQL queries**
```typescript
// apps/web/src/graphql/my-feature.ts
import { gql } from '@apollo/client';

export const GET_MY_FEATURES = gql`
  query GetMyFeatures {
    myFeatures {
      id
      name
      createdAt
    }
  }
`;

export const CREATE_MY_FEATURE = gql`
  mutation CreateMyFeature($input: CreateMyFeatureInput!) {
    createMyFeature(input: $input) {
      id
      name
    }
  }
`;
```

4. **Add navigation link** (if needed)
```typescript
// Update dashboard navigation component
{/* In dashboard layout or nav component */}
<Link href="/dashboard/my-page">My Page</Link>
```

### 3. Adding Real-time Updates

**Backend (Gateway):**

```typescript
// my-feature/my-feature.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/my-feature',
})
export class MyFeatureGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('feature:created')
  handleFeatureCreated(client: Socket, payload: any) {
    // Broadcast to all clients
    this.server.emit('feature:created', payload);
  }
}
```

**Frontend (Hook):**

```typescript
// apps/web/src/hooks/use-my-feature-websocket.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useMyFeatureWebSocket(onFeatureCreated: (data: any) => void) {
  useEffect(() => {
    const socket = io('http://localhost:3001/my-feature');

    socket.on('feature:created', onFeatureCreated);

    return () => {
      socket.off('feature:created', onFeatureCreated);
      socket.close();
    };
  }, [onFeatureCreated]);
}
```

### 4. Database Migrations (Production)

Currently using `synchronize: true` in development, but for production:

```typescript
// Create migration
npm run migration:generate -- -n CreateMyFeatureTable

// Run migrations
npm run migration:run

// Revert migration
npm run migration:revert
```

**Important:** Never use `synchronize: true` in production!

---

## Key Patterns

### 1. Authentication Flow

**Backend:**
1. User registers/logs in via GraphQL mutation
2. `AuthService` validates credentials
3. JWT token generated with user ID
4. Token returned to client

**Frontend:**
1. Store token in Zustand store (persisted to localStorage)
2. Apollo Client includes token in Authorization header
3. Protected routes use `useAuth()` hook
4. Token validated on backend via `GqlAuthGuard`

**Current User Decorator:**
```typescript
// Backend
@Query(() => User)
@UseGuards(GqlAuthGuard)
async me(@CurrentUser() user: User) {
  return user;
}

// Frontend
const { user, loading } = useAuth();
```

### 2. GraphQL Code-First Schema

**Entity → GraphQL Type:**
```typescript
@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
```

**GraphQL schema auto-generated** at `http://localhost:3001/graphql`

### 3. Real-time Collaboration

**Pattern:**
1. User performs action (e.g., edits document)
2. Frontend sends GraphQL mutation
3. Backend saves to DB and emits WebSocket event
4. All connected clients receive event and update UI

**Example:**
```typescript
// Service
async updateDocument(id: string, content: string) {
  const doc = await this.save(id, content);
  this.gateway.server.emit('document:updated', doc);
  return doc;
}

// Frontend
socket.on('document:updated', (doc) => {
  // Update local state
});
```

### 4. Dynamic Schema (Database Studio)

**Pattern:**
- `DatabaseTable` entity defines table metadata
- `DatabaseColumn` entity defines column metadata
- Records stored in `simple-json` column for flexibility
- Validation performed based on column `type` enum

**Example:**
```typescript
@Entity('database_tables')
export class DatabaseTable {
  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => DatabaseColumn, column => column.table)
  columns: DatabaseColumn[];
}

@Entity('database_columns')
export class DatabaseColumn {
  @Column()
  name: string;

  @Column({ type: 'simple-enum', enum: ColumnType })
  type: ColumnType; // TEXT, NUMBER, EMAIL, etc.

  @Column({ type: 'simple-json', nullable: true })
  config: any; // Column-specific config
}
```

### 5. AI Integration Pattern

**RAG (Retrieval Augmented Generation):**
1. User sends query via Command Bar (Cmd+K)
2. Backend searches vector DB for relevant context (embeddings)
3. Context + query sent to OpenAI GPT-4
4. Response returned and displayed

**Example:**
```typescript
// Backend
async query(prompt: string, userId: string) {
  // Get relevant documents from vector DB
  const context = await this.vectorSearch(prompt);

  // Send to OpenAI
  const response = await this.openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: `Context: ${context}\n\nQuery: ${prompt}` },
    ],
  });

  return response.choices[0].message.content;
}
```

---

## Testing Guidelines

### Current State

**Testing infrastructure is configured but not yet implemented.**

### Recommended Approach

**Backend (Jest):**

```typescript
// my-feature/my-feature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MyFeatureService } from './my-feature.service';
import { MyFeature } from './entities/my-feature.entity';

describe('MyFeatureService', () => {
  let service: MyFeatureService;
  let repository: Repository<MyFeature>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyFeatureService,
        {
          provide: getRepositoryToken(MyFeature),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MyFeatureService>(MyFeatureService);
    repository = module.get<Repository<MyFeature>>(
      getRepositoryToken(MyFeature),
    );
  });

  it('should create a feature', async () => {
    const input = { name: 'Test Feature' };
    const expected = { id: '1', ...input };

    jest.spyOn(repository, 'create').mockReturnValue(expected as any);
    jest.spyOn(repository, 'save').mockResolvedValue(expected as any);

    const result = await service.create(input);

    expect(result).toEqual(expected);
    expect(repository.create).toHaveBeenCalledWith(input);
    expect(repository.save).toHaveBeenCalled();
  });
});
```

**Frontend (Jest + React Testing Library):**

```typescript
// my-component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# Backend
cd apps/api
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:cov          # Coverage report

# Frontend
cd apps/web
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
```

---

## Deployment

### Development

```bash
# Start infrastructure
pnpm docker:dev

# Start API
cd apps/api && pnpm dev

# Start Web
cd apps/web && pnpm dev
```

### Production (Docker Compose)

```bash
# Build images
pnpm build

# Start production services
pnpm docker:prod
```

### Environment-Specific Configuration

**Development:**
- `synchronize: true` (auto-create DB schema)
- `logging: true` (SQL queries logged)
- CORS enabled for all origins

**Production:**
- `synchronize: false` (use migrations)
- `logging: false` (performance)
- CORS restricted to allowed origins
- SSL enabled for PostgreSQL
- Rate limiting enabled
- JWT secrets from secure vault

### Kubernetes (Future)

Planned support for Kubernetes deployment with Helm charts.

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem:** `ECONNREFUSED` or `database "dataverse" does not exist`

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart infrastructure
docker-compose -f docker/docker-compose.dev.yml down
docker-compose -f docker/docker-compose.dev.yml up -d

# Verify connection
docker exec -it postgres psql -U dataverse -d dataverse
```

#### 2. GraphQL Schema Not Updating

**Problem:** Schema changes not reflected in GraphQL Playground

**Solution:**
```bash
# Restart API server (schema regenerates on startup)
cd apps/api
pnpm dev
```

#### 3. WebSocket Connection Issues

**Problem:** Real-time updates not working

**Solution:**
```typescript
// Check CORS settings in main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

// Check WebSocket namespace
const socket = io('http://localhost:3001/namespace'); // Correct namespace
```

#### 4. JWT Token Expired

**Problem:** `Unauthorized` errors on protected routes

**Solution:**
```typescript
// Frontend: Clear token and redirect to login
const { logout } = useAuth();
logout();
```

#### 5. TypeORM Synchronization Conflicts

**Problem:** Schema changes causing conflicts

**Solution:**
```bash
# Drop and recreate database (DEVELOPMENT ONLY!)
docker exec -it postgres psql -U dataverse -c "DROP DATABASE dataverse;"
docker exec -it postgres psql -U dataverse -c "CREATE DATABASE dataverse;"

# Restart API to regenerate schema
cd apps/api && pnpm dev
```

#### 6. pnpm Installation Issues

**Problem:** Dependencies not installing correctly

**Solution:**
```bash
# Clear pnpm cache
pnpm store prune

# Remove all node_modules
pnpm clean

# Reinstall
pnpm install
```

### Debugging Tips

**Backend:**
```typescript
// Enable detailed logging
console.log('Debug:', JSON.stringify(data, null, 2));

// Use NestJS Logger
import { Logger } from '@nestjs/common';
const logger = new Logger('MyService');
logger.debug('Debug message');
logger.error('Error message', error.stack);
```

**Frontend:**
```typescript
// Apollo Client DevTools
// Install extension: https://www.apollographql.com/docs/react/development-testing/developer-tooling/

// Log GraphQL queries
const client = new ApolloClient({
  // ...
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(`GraphQL error: ${message}`, locations, path)
      );
    }
    if (networkError) {
      console.error('Network error:', networkError);
    }
  },
});
```

---

## Additional Resources

### Documentation

- **README.md** - Quick start guide and feature overview
- **DATAVERSE_OS_ARCHITECTURE.md** - Detailed architecture documentation
- **GraphQL Playground** - http://localhost:3001/graphql (interactive API docs)
- **Database UI (Adminer)** - http://localhost:8080

### External References

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [Apollo GraphQL Documentation](https://www.apollographql.com/docs/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

### Key Contacts

- **Repository:** [GitHub URL]
- **Issues:** [GitHub Issues URL]
- **Security:** security@dataverse.io (if applicable)

---

## Version History

**v1.0 - 2025-11-16**
- Initial CLAUDE.md creation
- Comprehensive codebase documentation
- Development workflows and conventions
- Architecture and patterns documentation

---

## AI Assistant Guidelines

When working on this codebase as an AI assistant:

1. **Always check this file first** before making changes
2. **Follow naming conventions** strictly (snake_case DB, camelCase TS)
3. **Use existing patterns** - don't invent new ones unless necessary
4. **Test changes** - ensure API and frontend both work
5. **Update documentation** - keep this file current with changes
6. **Ask for clarification** - if conventions are unclear
7. **Be consistent** - follow established module structures
8. **Security first** - validate inputs, use guards, handle errors
9. **Type safety** - avoid `any`, use proper TypeScript types
10. **Performance** - consider real-time implications, use indexes

**When adding new features:**
- Create feature branch from `develop`
- Follow module pattern (entity → DTO → service → resolver → module)
- Add GraphQL queries/mutations on frontend
- Test locally before committing
- Update CLAUDE.md if introducing new patterns

**When fixing bugs:**
- Understand the issue first (read code, check logs)
- Fix root cause, not symptoms
- Add validation/checks to prevent recurrence
- Test thoroughly (API + frontend)

**When refactoring:**
- Don't change too much at once
- Ensure backward compatibility
- Update tests if they exist
- Document breaking changes

---

**Happy coding! 🚀**

# Dataverse Project Structure - Comprehensive Overview

## Executive Summary

**Dataverse OS** is a unified sovereign workspace platform built as a **monorepo** using modern technologies. It's a super-application combining no-code tools, databases, collaboration, communication, and AI - replacing 20+ SaaS tools.

---

## 1. Overall Architecture

### Monorepo Structure
```
dataverse/
├── apps/
│   ├── api/          # NestJS Backend (GraphQL + REST)
│   └── web/          # Next.js Frontend (React 18)
├── packages/         # (Currently empty - can be expanded)
├── docker/           # Docker configurations
└── Config files      # turbo.json, pnpm-workspace.yaml, tsconfig.json
```

### Technology Stack Overview
- **Monorepo Tool**: Turbo (for task orchestration)
- **Package Manager**: pnpm (workspace-based)
- **Language**: TypeScript 5.3.3
- **Node.js**: ≥20.0.0

---

## 2. Backend Architecture (NestJS API)

### Framework & Setup
- **Framework**: NestJS 10.3.0 (TypeScript-first backend)
- **API Gateway**: GraphQL (Apollo Server 4.9.5)
- **API Path**: `/api/v1` (global prefix)
- **GraphQL Endpoint**: `/graphql`
- **Port**: 3001 (default)
- **Authentication**: JWT with Passport
- **Real-time**: WebSocket (Socket.io)

### Database & ORM
- **Primary Database**: PostgreSQL 
- **ORM**: TypeORM 0.3.17
- **Alternative**: SQLite support (with better-sqlite3)
- **Configuration**: Environment-based with SSL support
- **Type**: JSONB columns for flexible schemas (simple-json fallback for SQLite)

### Backend Modules (15 Modules)

Each module follows a standard pattern: Entity → Service → Resolver → Module

#### Core Modules:
1. **Auth Module** - JWT authentication, login/register, Passport strategies
2. **Users Module** - User management, profiles, roles
3. **Database Module** - Dynamic table/column management
4. **Health Module** - Health checks

#### Business Modules:
5. **Chat Module** - Real-time messaging with channels, DMs
6. **Workflow Module** - Visual workflow builder and execution
7. **AI Module** - GPT integration, RAG, embeddings, conversations
8. **Builder Module** - No-code page builder
9. **Video Module** - WebRTC video calls with participants
10. **Mail Module** - Email management
11. **Office Module** - Documents, spreadsheets
12. **MCP Module** - Model Context Protocol integration

#### Infrastructure Modules:
13. **WebSocket Module** - Real-time sync, notifications
14. **Marketplace Module** - Extensions and plugins
15. **Mobile Module** - Mobile app support

### Directory Structure
```
apps/api/src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module with TypeORM & GraphQL config
├── common/
│   ├── decorators/         # @CurrentUser decorator
│   └── guards/             # JwtAuthGuard, authorization
└── modules/
    ├── users/
    │   ├── user.entity.ts          # Entity with @ObjectType @Entity
    │   ├── users.service.ts        # Business logic
    │   ├── users.resolver.ts       # GraphQL queries/mutations
    │   └── users.module.ts         # NestJS module
    ├── database/
    │   ├── entities/
    │   │   ├── database-table.entity.ts
    │   │   ├── database-column.entity.ts
    │   │   └── database-record.entity.ts
    │   ├── database.service.ts
    │   ├── database.resolver.ts
    │   ├── records.service.ts
    │   ├── records.resolver.ts
    │   └── database.module.ts
    └── [other modules follow same pattern]
```

---

## 3. Entity & Database Patterns

### Entity Pattern (TypeORM + GraphQL)

All entities combine **TypeORM decorators** and **GraphQL ObjectType decorators**:

```typescript
@ObjectType()                    // GraphQL type
@Entity('table_name')            // Database table
export class ExampleEntity {
  @Field(() => ID)               // GraphQL field (exposed)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()                        // GraphQL field (exposed)
  @Column()
  name: string;

  @HideField()                    // GraphQL field (hidden)
  @Column()
  password: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Field(() => User)             // GraphQL relation
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Computed fields
  @Field({ nullable: true })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

### Key Entities

#### 1. **User Entity** (users module)
- UUID PK, email (unique, indexed), password (bcrypt)
- Fields: username, firstName, lastName, avatar
- Status: isActive, isEmailVerified, lastLoginAt
- Roles: simple-array type
- Auth guard depends on this

#### 2. **Database Dynamic Schema Entities**
Three-tier hierarchy:

- **DatabaseTable** (database_tables)
  - Relations: OneToMany → DatabaseColumn (eager loaded)
  - Fields: name, slug (unique), description, icon, metadata (JSONB)
  - Timestamps and createdBy user
  
- **DatabaseColumn** (database_columns)
  - Enum: TEXT, NUMBER, DATE, EMAIL, SELECT, RELATION, FILE, JSON, etc. (14 types)
  - Fields: name, slug, type, isRequired, isUnique, order, defaultValue
  - Options: JSONB for type-specific config
  - ManyToOne → DatabaseTable (CASCADE delete)
  
- **DatabaseRecord** (database_records)
  - data: JSONB column storing flexible record data
  - createdBy/updatedBy: user tracking
  - Index on (tableId, createdAt) for performance

#### 3. **Workflow Entities**
- **Workflow** - Name, trigger type/config, nodes, edges (visual flow)
- **WorkflowExecution** - Execution history and state
- **WorkflowLog** - Detailed execution logs

#### 4. **AI Entities**
- **AIConversation** - Title, isPinned, user association
- **AIMessage** - Role (enum: user/assistant/system), content, metadata
- **DocumentEmbedding** - Vector embeddings for RAG

#### 5. **Chat Entities**
- **Channel** - Public/private channels with members
- **Message** - Content, attachments, reactions, replies

#### 6. **Video Entities**
- **VideoCall** - Call state and participants
- **VideoCallParticipant** - Participant metadata

---

## 4. Service & Resolver Patterns

### Service Pattern (Business Logic)

Services use **Repository Injection** from TypeORM:

```typescript
@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(Example)
    private readonly repository: Repository<Example>,
  ) {}

  // Standard CRUD methods
  async create(data: CreateInput): Promise<Example> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(): Promise<Example[]> {
    return this.repository.find({
      relations: ['relatedEntity'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Example> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  async update(id: string, data: UpdateInput): Promise<Example> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Entity not found');
    }
  }
}
```

### Resolver Pattern (GraphQL API)

```typescript
@Resolver(() => Example)
export class ExampleResolver {
  constructor(private readonly service: ExampleService) {}

  // Queries
  @Query(() => [Example])
  @UseGuards(JwtAuthGuard)
  async examples(): Promise<Example[]> {
    return this.service.findAll();
  }

  @Query(() => Example)
  @UseGuards(JwtAuthGuard)
  async example(@Args('id') id: string): Promise<Example> {
    return this.service.findOne(id);
  }

  // Mutations
  @Mutation(() => Example)
  @UseGuards(JwtAuthGuard)
  async createExample(
    @Args('input') input: CreateExampleInput,
    @CurrentUser() user: User,
  ): Promise<Example> {
    return this.service.create({ ...input, userId: user.id });
  }

  @Mutation(() => Example)
  @UseGuards(JwtAuthGuard)
  async updateExample(
    @Args('id') id: string,
    @Args('input') input: UpdateExampleInput,
    @CurrentUser() user: User,
  ): Promise<Example> {
    return this.service.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteExample(
    @Args('id') id: string,
  ): Promise<boolean> {
    await this.service.delete(id);
    return true;
  }
}
```

### Authentication & Authorization

**Custom Decorators:**
```typescript
@CurrentUser()  // Extracts user from JWT in context
```

**Guards:**
```typescript
@UseGuards(JwtAuthGuard)  // Validates JWT token, populates req.user
```

**Pattern:**
```typescript
@UseGuards(JwtAuthGuard)
async method(@CurrentUser() user: User): Promise<Result> {
  // user is available from JWT token
}
```

---

## 5. Data Transfer Objects (DTOs)

### DTO Pattern

DTOs use GraphQL `@InputType()` decorator with class-validator decorators:

```typescript
@InputType()
export class CreateExampleInput {
  @Field()
  @IsString()
  @MinLength(1)
  title: string;

  @Field()
  @IsEnum(SomeEnum)
  status: SomeEnum;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSONObject)
  config: Record<string, any>;
}

@InputType()
export class UpdateExampleInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  // Only partial fields allowed in update
}
```

### Class-Validator Decorators Used
- `@IsString()`, `@IsNumber()`, `@IsBoolean()`
- `@IsEmail()`, `@IsEnum()`, `@MinLength()`, `@MaxLength()`
- `@IsOptional()` - makes field nullable
- `@IsNotEmpty()`

**Note:** Validation is automatic via global ValidationPipe in main.ts

---

## 6. API Response Patterns

### Success Response
GraphQL returns the entity directly:
```graphql
query {
  user(id: "123") {
    id
    email
    firstName
    lastName
    roles
  }
}
```

### Error Handling
NestJS exceptions thrown in services:
```typescript
throw new NotFoundException('User not found');
throw new ForbiddenException('Not authorized');
throw new BadRequestException('Invalid input');
```

---

## 7. Frontend Architecture (Next.js)

### Framework & Setup
- **Framework**: Next.js 14.0.4 (App Router)
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.0 + Radix UI components
- **Icons**: Lucide React
- **State Management**: Zustand (for auth, UI state)
- **GraphQL Client**: Apollo Client 3.8.8
- **Real-time**: Socket.io client
- **Port**: 3000 (default)

### Frontend Structure
```
apps/web/src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects to dashboard/login)
│   ├── auth/              # Auth pages (login, register)
│   ├── dashboard/         # Main dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── database/      # Database studio
│   │   ├── builder/       # No-code builder
│   │   ├── chat/          # Chat module
│   │   ├── workflow/      # Workflow builder
│   │   ├── ai/            # AI chat
│   │   ├── video/         # Video calls
│   │   └── [other pages]
│   ├── p/[slug]/          # Public pages (published builder pages)
│   └── globals.css
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities
├── store/                 # Zustand stores
├── graphql/              # GraphQL queries/mutations
└── [config files]
```

### State Management (Zustand)

Example auth store:
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);

// Usage: const { user, logout } = useAuthStore();
```

### GraphQL Client Setup

Uses Apollo Client with auth token in headers. Queries organized by module:
- `graphql/chat.ts`
- `graphql/workflow.ts`
- `graphql/builder.ts`
- etc.

Fragment pattern for reusable fields:
```typescript
export const CHANNEL_FIELDS = gql`
  fragment ChannelFields on Channel {
    id
    name
    description
    type
  }
`;

export const GET_CHANNELS = gql`
  query GetChannels {
    channels {
      ...ChannelFields
    }
  }
  ${CHANNEL_FIELDS}
`;
```

---

## 8. Module Pattern Template

Every module follows this structure:

### Module File (example.module.ts)
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([ExampleEntity])],
  providers: [ExampleService, ExampleResolver],
  exports: [ExampleService, TypeOrmModule],
})
export class ExampleModule {}
```

### Service (example.service.ts)
- Injected repositories
- Business logic (CRUD + custom methods)
- Error handling
- Service-to-service communication

### Resolver (example.resolver.ts)
- @Resolver() decorator with entity type
- @Query() methods for fetches
- @Mutation() methods for writes
- @UseGuards(JwtAuthGuard) for protected routes
- @CurrentUser() decorator for user context

### Entity (example.entity.ts)
- @Entity() and @ObjectType() decorators
- TypeORM column definitions
- GraphQL @Field() decorators
- Relations with proper JoinColumn definitions
- Timestamps (@CreateDateColumn, @UpdateDateColumn)

---

## 9. Database Configuration

### Environment Variables (from .env.example)

```env
# Application
NODE_ENV=development
HOST=0.0.0.0
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dataverse
DB_PASSWORD=dataverse
DB_DATABASE=dataverse
DB_SSL=false  # Set to 'true' for cloud PostgreSQL

# Redis (optional caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql

# AI Services (optional)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Storage (MinIO/S3)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=dataverse

# Email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@dataverse.local
```

### TypeORM Configuration (in app.module.ts)

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',  // or 'sqlite'
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }),
})
```

---

## 10. Real-time Communication (WebSocket)

### WebSocket Integration

- **Library**: Socket.io
- **Module**: WebsocketModule
- **Gateway**: WebsocketGateway

**Usage in Services:**
```typescript
constructor(private readonly websocketGateway: WebsocketGateway) {}

// Emit to all clients
this.websocketGateway.emitToAll('event:name', { data: payload });

// Emit to specific room
this.websocketGateway.emitToRoom('room-id', 'event:name', payload);
```

**Frontend Hook:**
```typescript
const { connected, data } = useWebsocket('room-id', 'event-name');
```

---

## 11. AI Integration Patterns

### AI Service Pattern

OpenAI integration with context-aware prompts:

```typescript
@Injectable()
export class AIService {
  private openai: OpenAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async chat(message: string, userId: string): Promise<AIResponse> {
    // Get context (database tables, documents, etc.)
    const tables = await this.databaseService.findAll();
    
    // Create system prompt with context
    const systemPrompt = `You are DataVerse AI Assistant...
Available tables: ${tables.map(t => t.name).join(', ')}`;

    // Call OpenAI
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      answer: completion.choices[0].message.content,
      context: 'Based on your workspace',
    };
  }
}
```

---

## 12. Development Workflow

### Build & Run Commands

```bash
# Install dependencies
pnpm install

# Development mode (all packages)
pnpm run dev

# Build (all packages)
pnpm run build

# Run specific package
pnpm --filter @dataverse/api dev
pnpm --filter @dataverse/web dev

# Test
pnpm run test

# Lint
pnpm run lint

# Format
pnpm run format
```

### Development URLs
- Frontend: http://localhost:3000
- API: http://localhost:3001/api/v1
- GraphQL Playground: http://localhost:3001/graphql
- Database API will serve on port 3001

---

## 13. Key Integration Points for FootMind Engine

To integrate a FootMind Engine module, follow these patterns:

### 1. Create Entity
- Place in `apps/api/src/modules/football/entities/`
- Use @Entity() and @ObjectType() decorators
- Include user relationships for tracking ownership
- Use UUIDs for primary keys
- Add timestamps (createdAt, updatedAt)

### 2. Create Service
- Place in `apps/api/src/modules/football/`
- Inject repositories using @InjectRepository()
- Implement CRUD methods
- Add business logic methods
- Handle error cases with proper exceptions

### 3. Create Resolver
- Place in `apps/api/src/modules/football/`
- Use @Resolver() decorator
- Create @Query() and @Mutation() methods
- Use @UseGuards(JwtAuthGuard) for protection
- Inject @CurrentUser() for user context

### 4. Create Module
- Combine entity, service, resolver
- Export for use in other modules
- Register in app.module.ts

### 5. Create DTOs
- Place in `apps/api/src/modules/football/dto/`
- Use @InputType() for GraphQL inputs
- Add validation with class-validator decorators

### 6. Database Schema Versioning
- TypeORM auto-sync in development
- Manual migrations in production
- Consider adding TypeORM migration system

### 7. Real-time Updates
- Use WebsocketGateway for live updates
- Emit events when data changes
- Frontend subscribes via Socket.io

---

## 14. File Organization Checklist

For new modules, ensure:
```
apps/api/src/modules/footmind/
├── entities/
│   ├── team.entity.ts
│   ├── player.entity.ts
│   ├── match.entity.ts
│   └── [more entities].entity.ts
├── dto/
│   ├── create-team.dto.ts
│   ├── update-team.dto.ts
│   └── [more DTOs].dto.ts
├── footmind.service.ts
├── footmind.resolver.ts
├── footmind.module.ts
└── [tests if needed]
```

---

## Summary Table

| Aspect | Technology | Location |
|--------|-----------|----------|
| **Backend Framework** | NestJS 10.3 | `apps/api/src` |
| **Database** | PostgreSQL + TypeORM | Environment config |
| **API Type** | GraphQL (Apollo) + REST | `apps/api/src/modules` |
| **Authentication** | JWT + Passport | `modules/auth` |
| **Frontend Framework** | Next.js 14 | `apps/web/src` |
| **UI Components** | Radix UI + Tailwind | `apps/web/src/components` |
| **State Management** | Zustand | `apps/web/src/store` |
| **Real-time** | Socket.io | `modules/websocket` |
| **AI Integration** | OpenAI API | `modules/ai` |
| **Monorepo Tool** | Turbo + pnpm | Root config files |

---

## Next Steps for FootMind Engine

1. Create `apps/api/src/modules/footmind/` directory
2. Design entities (Team, Player, Match, Statistics, etc.)
3. Implement service with business logic
4. Create GraphQL resolver
5. Build frontend pages in `apps/web/src/app/dashboard/footmind/`
6. Implement real-time updates via WebSocket
7. Add AI insights using AIService pattern
8. Register module in `app.module.ts`


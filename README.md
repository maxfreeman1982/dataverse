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
- ✅ Frontend (Next.js + React + Tailwind)
- ✅ Dashboard & Navigation
- ✅ Database Studio UI
- ✅ **Dynamic CRUD** - Full data management with validation
- ✅ **Real-time Collaboration** - Live updates via WebSocket
- ✅ **AI Integration** - GPT-powered assistant (Cmd+K)
- ✅ **No-Code Builder** - Visual page builder with 12+ components
- ✅ **Chat Module** - Real-time messaging with channels and DMs
- ✅ **Advanced AI (RAG)** - GPT-4 with semantic search & conversation history
- ✅ **Workflow Automation** - Automate tasks with visual workflow builder
- ✅ **Video Calls (WebRTC)** - Real-time video conferencing with screen sharing
- ✅ **Mail AI** - Intelligent email client with AI-powered features
- ✅ **Office Suite** - Documents, spreadsheets, and presentations
- ✅ **MCP Integration** - Model Context Protocol for AI extensibility

## 🏗️ Architecture

```
dataverse/
├── apps/
│   ├── api/          # Backend API (NestJS + GraphQL)
│   └── web/          # Frontend (Next.js + React + Tailwind)
├── packages/
│   ├── database/     # Database utilities
│   ├── auth/         # Authentication module
│   ├── shared/       # Shared types
│   └── ui/           # UI components
├── docker/           # Docker configurations
└── docs/             # Documentation
```

## ⭐ Key Features

### 1. Dynamic CRUD System
- **Dynamic data storage** with JSONB for flexible schemas
- **Type validation** for 13+ column types (text, number, date, email, etc.)
- **Real-time data grid** with sorting, filtering, and pagination
- **Inline editing** with dynamic form generation
- **Bulk operations** and advanced querying

### 2. Real-time Collaboration
- **WebSocket integration** with Socket.io
- **Live updates** across all connected clients
- **Room-based events** (per table)
- **Instant notifications** when data changes
- **Connection status** indicator

### 3. AI Assistant
- **Command Bar** (Cmd+K) for quick access
- **GPT-powered** responses using OpenAI
- **Context-aware** based on workspace data
- **Natural language** queries
- **Smart suggestions** for database schemas

### 4. No-Code Builder
- **Visual page editor** with drag-and-drop interface
- **12+ component types** (Text, Heading, Button, Form, Table, Card, etc.)
- **Property editor** panel for customizing components
- **Real-time collaboration** - see changes from other users instantly
- **Publish/Unpublish** pages with slug-based routing
- **Public page viewer** at `/p/[slug]` for published pages
- **Component library** with extensive styling options

### 5. Communication (Chat)
- **Real-time messaging** with WebSocket integration
- **Channels** - Public, private, and direct message channels
- **Message features** - Edit, delete, reply, reactions
- **Typing indicators** - See when users are typing
- **Channel management** - Create, update, archive channels
- **Member management** - Add/remove members from channels
- **Message history** - Full message history with pagination
- **Real-time updates** - Instant message delivery

### 6. Advanced AI with RAG
- **GPT-4 Turbo** - State-of-the-art language model
- **RAG (Retrieval Augmented Generation)** - Semantic search through workspace content
- **Document Embeddings** - Automatic indexing of tables, pages, and messages
- **Conversation History** - Persistent AI chat sessions
- **Context-Aware Responses** - AI understands your workspace data
- **Smart Workspace Search** - Find relevant information using natural language
- **Analytics Dashboard** - Track AI usage, tokens, and indexed documents
- **One-Click Reindexing** - Keep embeddings up to date
- **Pinnable Conversations** - Organize important AI interactions
- **Real-time WebSocket Updates** - Instant AI message delivery

### 7. Workflow Automation
- **Visual Workflow Builder** - Create automation without code
- **Multiple Trigger Types** - Manual, record events, schedule, webhook
- **9 Action Types** - CRUD operations, messages, AI tasks, conditions, delays, webhooks
- **Conditional Branching** - Execute different paths based on conditions
- **Variable Resolution** - Dynamic data using {{variable.path}} syntax
- **Async Execution** - Non-blocking workflow runs
- **Execution Logs** - Detailed logs for debugging
- **Execution History** - Track all workflow runs with status
- **Real-time Status** - See workflow execution status live
- **Enable/Disable** - Control workflow activation

### 8. Video Calls (WebRTC)
- **Multi-Party Video Calls** - Support for multiple participants
- **WebRTC Peer-to-Peer** - Direct peer connections for low latency
- **Audio Controls** - Mute/unmute microphone
- **Video Controls** - Enable/disable camera
- **Screen Sharing** - Share your screen with participants
- **Real-time Signaling** - WebSocket-based WebRTC signaling
- **Chat Integration** - Start calls directly from chat channels
- **Call History** - Track past video calls
- **Participant Status** - See who's in the call and their media status
- **Automatic Grid Layout** - Responsive video grid that adapts to participant count
- **STUN Server Support** - NAT traversal with Google STUN servers
- **Connection State Management** - Automatic reconnection and cleanup

### 9. Mail AI
- **Intelligent Email Client** - Full-featured email management
- **AI-Powered Summaries** - Automatic email summarization with GPT-4
- **Smart Categorization** - Auto-categorize emails (Work, Personal, Marketing, etc.)
- **Sentiment Analysis** - Understand email tone and priority
- **Smart Replies** - AI-generated suggested responses
- **AI Compose** - Generate professional emails from natural language prompts
- **Email Threading** - Conversation-based email organization
- **Folder Management** - Inbox, Sent, Drafts, Archive, Trash
- **Star & Priority** - Mark important emails
- **Search** - Full-text email search
- **Real-time Updates** - Instant email notifications via WebSocket
- **Draft Saving** - Save emails as drafts
- **Labels & Tags** - Organize emails with custom labels

### 10. Office Suite
- **Documents** - Rich text editor for creating and editing documents
  - Auto-save with debounced updates
  - Word count and character count tracking
  - Simple rich text formatting
  - Real-time collaboration ready
  - Document versioning and history
- **Spreadsheets** - Full-featured spreadsheet application
  - Grid-based cell editing
  - Multiple sheets per workbook
  - Formula bar for advanced editing
  - 26 columns × 100 rows per sheet
  - Cell selection and highlighting
  - Auto-save functionality
- **Presentations** - Slide-based presentation builder
  - Multi-slide management
  - Slide thumbnails sidebar
  - Presentation mode with navigation
  - Simple slide layouts
  - Auto-save with real-time updates
  - Slide ordering and deletion

### 11. MCP Integration (Model Context Protocol)
- **Server Management** - Connect to external MCP servers
  - HTTP, WebSocket, and STDIO protocol support
  - Server status monitoring (connected, disconnected, error)
  - Enable/disable servers dynamically
  - Auto-discovery of available tools
  - Connection health tracking
- **Tool Discovery** - Automatic tool detection and schema parsing
  - JSON Schema support for tool parameters
  - Tool categorization with tags
  - Usage statistics tracking
  - Tool enable/disable controls
- **Tool Execution** - Execute external tools with parameter validation
  - Dynamic parameter forms based on JSON Schema
  - Real-time execution with results
  - Error handling and retry logic
  - Execution history and analytics
- **AI Integration** - Extend AI capabilities with custom tools
  - Web search integration
  - Code interpreter support
  - Image generation capabilities
  - File operations and data processing
  - Custom tool development support
- **Public/Private Servers** - Share servers with team or keep private
- **Mock Tools** - Built-in demo tools for testing (web_search, code_interpreter, image_generator, file_reader)

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

**Important:** To enable AI features, add your OpenAI API key to `.env`:
```bash
OPENAI_API_KEY=sk-your-api-key-here
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

6. **Start the Frontend** (in a new terminal)
```bash
cd apps/web
pnpm install
pnpm run dev
```

The web app will be available at:
- Frontend: http://localhost:3000

**Default credentials for testing:**
- Create a new account via the Register page
- Or use GraphQL Playground to create a user first

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
- `src/modules/database/` - Database Studio (table schema + dynamic CRUD)
- `src/modules/builder/` - No-Code Builder (pages & components)
- `src/modules/chat/` - Communication (channels, messages, real-time chat)
- `src/modules/video/` - Video Calls (WebRTC signaling, call management)
- `src/modules/mail/` - Mail AI (email management, AI analysis, smart features)
- `src/modules/office/` - Office Suite (documents, spreadsheets, presentations)
- `src/modules/mcp/` - MCP Integration (Model Context Protocol, tool execution)
- `src/modules/ai/` - AI Assistant (OpenAI integration, RAG, embeddings)
- `src/modules/workflow/` - Workflow Automation (execution engine, triggers)
- `src/modules/websocket/` - Real-time collaboration
- `src/modules/health/` - Health checks
- `src/common/` - Shared utilities (guards, decorators, etc.)

**Frontend (apps/web):**
- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/lib/` - Utilities (Apollo client, utils)
- `src/store/` - State management (Zustand)
- `src/hooks/` - Custom React hooks

### Tech Stack

**Backend:**
- NestJS - Framework
- TypeORM - ORM
- PostgreSQL - Primary database (with JSONB for dynamic data)
- GraphQL (Apollo) - API layer
- JWT - Authentication
- Redis - Cache & sessions
- **Socket.io** - Real-time WebSocket
- **OpenAI API** - AI integration

**Frontend:**
- Next.js 14 - React framework (App Router)
- React 18 - UI library
- TypeScript - Type safety
- Tailwind CSS - Styling
- Shadcn/ui - Component library
- Apollo Client - GraphQL client
- Zustand - State management
- **Socket.io-client** - Real-time updates
- **cmdk** - Command palette

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
cd apps/web && pnpm dev   # Start Frontend only

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

### Phase 1 (Completed) ✅ - Foundation
- [x] Project structure (Monorepo)
- [x] Backend API (NestJS)
- [x] Authentication (JWT)
- [x] User management
- [x] Database Studio schema management
- [x] Frontend (Next.js + React + Tailwind)
- [x] Dashboard & Navigation
- [x] Database Studio UI
- [x] **Dynamic CRUD system**
- [x] **Real-time collaboration (Socket.io)**
- [x] **AI Integration (OpenAI)**
- [x] **Command Bar (Cmd+K)**

### Phase 2 (Completed) ✅ - Core Features
- [x] **No-Code Builder** (visual page editor with 12+ components) ✅
- [x] **Communication module** (real-time chat with channels) ✅
- [x] **Advanced AI features** (RAG with GPT-4 Turbo, embeddings, conversation history) ✅
- [x] **Workflow automation** (visual builder, 9 action types, conditional logic) ✅

### Phase 3 (Current) - Advanced Features
- [x] **Video calls** (WebRTC multi-party calls, screen sharing) ✅
- [x] **Mail AI** (intelligent email with AI summaries, smart replies, auto-categorization) ✅
- [x] **Office Suite** (documents, spreadsheets, presentations with real-time sync) ✅
- [x] **MCP Integration** (Model Context Protocol, external tool execution, AI extensibility) ✅
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

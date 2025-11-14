import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './modules/database/database.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { AIModule } from './modules/ai/ai.module';
import { BuilderModule } from './modules/builder/builder.module';
import { ChatModule } from './modules/chat/chat.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { VideoModule } from './modules/video/video.module';
import { MailModule } from './modules/mail/mail.module';
import { OfficeModule } from './modules/office/office.module';
import { MCPModule } from './modules/mcp/mcp.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { MobileAppModule } from './modules/mobile/mobile-app.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // TypeORM - SQLite (for development/testing)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get('DB_DATABASE', 'dataverse.db'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: true, // Auto-create tables in development
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
    }),

    // Application modules
    WebsocketModule,
    HealthModule,
    AuthModule,
    UsersModule,
    DatabaseModule,
    AIModule,
    BuilderModule,
    ChatModule,
    WorkflowModule,
    VideoModule,
    MailModule,
    OfficeModule,
    MCPModule,
    MarketplaceModule,
    MobileAppModule,
  ],
})
export class AppModule {}

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
import { PerfumeModule } from './modules/perfume/perfume.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // TypeORM - PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'dataverse'),
        password: configService.get('DB_PASSWORD', 'dataverse'),
        database: configService.get('DB_DATABASE', 'dataverse'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
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
    PerfumeModule,
  ],
})
export class AppModule {}

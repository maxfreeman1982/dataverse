import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuilderService } from './builder.service';
import { BuilderResolver } from './builder.resolver';
import { Page } from './entities/page.entity';
import { PageComponent } from './entities/page-component.entity';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, PageComponent]),
    WebsocketModule,
  ],
  providers: [BuilderService, BuilderResolver],
  exports: [BuilderService],
})
export class BuilderModule {}

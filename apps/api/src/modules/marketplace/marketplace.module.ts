import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plugin } from './entities/plugin.entity';
import { PluginInstallation } from './entities/plugin-installation.entity';
import { PluginReview } from './entities/plugin-review.entity';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceResolver } from './marketplace.resolver';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plugin, PluginInstallation, PluginReview]),
    WebsocketModule,
  ],
  providers: [MarketplaceService, MarketplaceResolver],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}

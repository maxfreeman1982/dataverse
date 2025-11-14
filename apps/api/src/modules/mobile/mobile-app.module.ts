import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileApp } from './entities/mobile-app.entity';
import { MobileAppBuild } from './entities/mobile-app-build.entity';
import { MobilePushNotification } from './entities/mobile-push-notification.entity';
import { MobileAppService } from './mobile-app.service';
import { MobileAppResolver } from './mobile-app.resolver';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MobileApp,
      MobileAppBuild,
      MobilePushNotification,
    ]),
    WebsocketModule,
  ],
  providers: [MobileAppService, MobileAppResolver],
  exports: [MobileAppService],
})
export class MobileAppModule {}

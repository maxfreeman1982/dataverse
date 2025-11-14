import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoCall } from './entities/video-call.entity';
import { VideoCallParticipant } from './entities/video-call-participant.entity';
import { VideoService } from './video.service';
import { VideoResolver } from './video.resolver';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoCall, VideoCallParticipant]),
    WebsocketModule,
  ],
  providers: [VideoService, VideoResolver],
  exports: [VideoService],
})
export class VideoModule {}

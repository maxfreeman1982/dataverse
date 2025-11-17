import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { VideoService } from './video.service';
import { VideoCall } from './entities/video-call.entity';
import { VideoCallParticipant } from './entities/video-call-participant.entity';
import {
  CreateVideoCallInput,
  JoinVideoCallInput,
  UpdateParticipantStatusInput,
  WebRTCSignalInput,
} from './dto/video-call.dto';

@Resolver(() => VideoCall)
@UseGuards(GqlAuthGuard)
export class VideoResolver {
  constructor(private videoService: VideoService) {}

  @Mutation(() => VideoCall)
  async createVideoCall(
    @Args('input') input: CreateVideoCallInput,
    @CurrentUser() user: User,
  ): Promise<VideoCall> {
    return this.videoService.createCall(input, user.id);
  }

  @Query(() => VideoCall)
  async videoCall(@Args('id', { type: () => ID }) id: string): Promise<VideoCall> {
    return this.videoService.getCallById(id);
  }

  @Query(() => [VideoCall])
  async videoCalls(@CurrentUser() user: User): Promise<VideoCall[]> {
    return this.videoService.getCalls(user.id);
  }

  @Mutation(() => VideoCallParticipant)
  async joinVideoCall(
    @Args('input') input: JoinVideoCallInput,
    @CurrentUser() user: User,
  ): Promise<VideoCallParticipant> {
    return this.videoService.joinCall(input, user.id);
  }

  @Mutation(() => Boolean)
  async leaveVideoCall(
    @Args('callId', { type: () => ID }) callId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.videoService.leaveCall(callId, user.id);
    return true;
  }

  @Mutation(() => VideoCallParticipant)
  async updateParticipantStatus(
    @Args('input') input: UpdateParticipantStatusInput,
    @CurrentUser() user: User,
  ): Promise<VideoCallParticipant> {
    return this.videoService.updateParticipantStatus(input, user.id);
  }

  @Mutation(() => Boolean)
  async sendWebRTCSignal(
    @Args('input') input: WebRTCSignalInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const data = JSON.parse(input.data);
    await this.videoService.sendSignal(
      input.callId,
      user.id,
      input.targetUserId,
      input.type,
      data,
    );
    return true;
  }

  @Mutation(() => VideoCall)
  async endVideoCall(
    @Args('callId', { type: () => ID }) callId: string,
  ): Promise<VideoCall> {
    return this.videoService.endCall(callId);
  }
}

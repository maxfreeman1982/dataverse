import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateVideoCallInput {
  @Field()
  name: string;

  @Field(() => ID, { nullable: true })
  channelId?: string;
}

@InputType()
export class JoinVideoCallInput {
  @Field(() => ID)
  callId: string;
}

@InputType()
export class UpdateParticipantStatusInput {
  @Field(() => ID)
  callId: string;

  @Field({ nullable: true })
  isAudioEnabled?: boolean;

  @Field({ nullable: true })
  isVideoEnabled?: boolean;

  @Field({ nullable: true })
  isScreenSharing?: boolean;
}

@InputType()
export class WebRTCSignalInput {
  @Field(() => ID)
  callId: string;

  @Field(() => ID)
  targetUserId: string;

  @Field()
  type: string; // 'offer', 'answer', 'ice-candidate'

  @Field()
  data: string; // JSON stringified SDP or ICE candidate
}

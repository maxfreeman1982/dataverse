import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoCall, CallStatus } from './entities/video-call.entity';
import { VideoCallParticipant } from './entities/video-call-participant.entity';
import {
  CreateVideoCallInput,
  JoinVideoCallInput,
  UpdateParticipantStatusInput,
} from './dto/video-call.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoCall)
    private videoCallRepository: Repository<VideoCall>,
    @InjectRepository(VideoCallParticipant)
    private participantRepository: Repository<VideoCallParticipant>,
    private websocketGateway: WebsocketGateway,
  ) {}

  async createCall(
    input: CreateVideoCallInput,
    userId: string,
  ): Promise<VideoCall> {
    const call = this.videoCallRepository.create({
      ...input,
      startedById: userId,
      status: CallStatus.WAITING,
    });

    const savedCall = await this.videoCallRepository.save(call);

    // Auto-join the creator
    await this.joinCall({ callId: savedCall.id }, userId);

    const fullCall = await this.getCallById(savedCall.id);

    this.websocketGateway.emitToAll('call:created', { call: fullCall });

    return fullCall;
  }

  async getCallById(id: string): Promise<VideoCall> {
    const call = await this.videoCallRepository.findOne({
      where: { id },
      relations: ['startedBy', 'channel', 'participants', 'participants.user'],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    return call;
  }

  async getCalls(userId: string): Promise<VideoCall[]> {
    // Get all active calls and calls user participated in
    const calls = await this.videoCallRepository
      .createQueryBuilder('call')
      .leftJoinAndSelect('call.startedBy', 'startedBy')
      .leftJoinAndSelect('call.channel', 'channel')
      .leftJoinAndSelect('call.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('call.status = :status', { status: CallStatus.ACTIVE })
      .orWhere('participants.userId = :userId', { userId })
      .orderBy('call.startedAt', 'DESC')
      .take(50)
      .getMany();

    return calls;
  }

  async joinCall(
    input: JoinVideoCallInput,
    userId: string,
  ): Promise<VideoCallParticipant> {
    const call = await this.getCallById(input.callId);

    // Check if user is already in the call
    const existingParticipant = await this.participantRepository.findOne({
      where: {
        callId: input.callId,
        userId,
        leftAt: null as any,
      },
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    const participant = this.participantRepository.create({
      callId: input.callId,
      userId,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
    });

    const savedParticipant = await this.participantRepository.save(participant);

    // Update call status to active if it was waiting
    if (call.status === CallStatus.WAITING) {
      call.status = CallStatus.ACTIVE;
      await this.videoCallRepository.save(call);
    }

    const fullParticipant = await this.participantRepository.findOne({
      where: { id: savedParticipant.id },
      relations: ['user'],
    });

    this.websocketGateway.emitToAll('call:participant-joined', {
      callId: input.callId,
      participant: fullParticipant,
    });

    return fullParticipant!;
  }

  async leaveCall(callId: string, userId: string): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: {
        callId,
        userId,
        leftAt: null as any,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    participant.leftAt = new Date();
    await this.participantRepository.save(participant);

    this.websocketGateway.emitToAll('call:participant-left', {
      callId,
      userId,
    });

    // Check if all participants have left
    const activeParticipants = await this.participantRepository.count({
      where: {
        callId,
        leftAt: null as any,
      },
    });

    if (activeParticipants === 0) {
      await this.endCall(callId);
    }
  }

  async updateParticipantStatus(
    input: UpdateParticipantStatusInput,
    userId: string,
  ): Promise<VideoCallParticipant> {
    const participant = await this.participantRepository.findOne({
      where: {
        callId: input.callId,
        userId,
        leftAt: null as any,
      },
      relations: ['user'],
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    if (input.isAudioEnabled !== undefined) {
      participant.isAudioEnabled = input.isAudioEnabled;
    }
    if (input.isVideoEnabled !== undefined) {
      participant.isVideoEnabled = input.isVideoEnabled;
    }
    if (input.isScreenSharing !== undefined) {
      participant.isScreenSharing = input.isScreenSharing;
    }

    const updated = await this.participantRepository.save(participant);

    this.websocketGateway.emitToAll('call:participant-updated', {
      callId: input.callId,
      participant: updated,
    });

    return updated;
  }

  async endCall(callId: string): Promise<VideoCall> {
    const call = await this.getCallById(callId);

    call.status = CallStatus.ENDED;
    call.endedAt = new Date();

    const updated = await this.videoCallRepository.save(call);

    this.websocketGateway.emitToAll('call:ended', { callId });

    return updated;
  }

  // WebRTC Signaling Methods
  async sendSignal(
    callId: string,
    fromUserId: string,
    toUserId: string,
    type: string,
    data: any,
  ): Promise<void> {
    // Verify the sender is in the call
    const participant = await this.participantRepository.findOne({
      where: {
        callId,
        userId: fromUserId,
        leftAt: null as any,
      },
    });

    if (!participant) {
      throw new ForbiddenException('Not a participant in this call');
    }

    // Send signal to target user
    this.websocketGateway.emitToUser(toUserId, 'webrtc:signal', {
      callId,
      fromUserId,
      type,
      data,
    });
  }
}

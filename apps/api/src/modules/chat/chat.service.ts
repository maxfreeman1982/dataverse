import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Channel, ChannelType } from './entities/channel.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/user.entity';
import {
  CreateChannelInput,
  UpdateChannelInput,
} from './dto/create-channel.dto';
import {
  CreateMessageInput,
  UpdateMessageInput,
  AddReactionInput,
} from './dto/create-message.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  // ========== CHANNEL OPERATIONS ==========

  async createChannel(
    input: CreateChannelInput,
    userId: string,
  ): Promise<Channel> {
    // Create channel
    const channel = this.channelRepository.create({
      name: input.name,
      description: input.description,
      type: input.type || ChannelType.PUBLIC,
      icon: input.icon,
      createdById: userId,
    });

    const savedChannel = await this.channelRepository.save(channel);

    // Add creator as member
    const creator = await this.userRepository.findOne({ where: { id: userId } });
    savedChannel.members = [creator];

    // Add additional members if provided
    if (input.memberIds && input.memberIds.length > 0) {
      const members = await this.userRepository.findBy({
        id: In(input.memberIds),
      });
      savedChannel.members = [...savedChannel.members, ...members];
    }

    await this.channelRepository.save(savedChannel);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('channel:created', { channel: savedChannel });

    return this.findChannelById(savedChannel.id);
  }

  async findAllChannels(userId: string): Promise<Channel[]> {
    // Find all channels where user is a member or public channels
    const channels = await this.channelRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.createdBy', 'createdBy')
      .leftJoinAndSelect('channel.members', 'members')
      .leftJoin('channel.members', 'userMembers')
      .where('channel.type = :type', { type: ChannelType.PUBLIC })
      .orWhere('userMembers.id = :userId', { userId })
      .andWhere('channel.isArchived = :isArchived', { isArchived: false })
      .orderBy('channel.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('channel.createdAt', 'DESC')
      .getMany();

    return channels;
  }

  async findChannelById(id: string): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      where: { id },
      relations: ['createdBy', 'members'],
    });

    if (!channel) {
      throw new NotFoundException(`Channel with ID "${id}" not found`);
    }

    return channel;
  }

  async updateChannel(
    id: string,
    input: UpdateChannelInput,
    userId: string,
  ): Promise<Channel> {
    const channel = await this.findChannelById(id);

    // Check if user is creator or admin
    if (channel.createdById !== userId) {
      throw new ForbiddenException('Only channel creator can update the channel');
    }

    Object.assign(channel, input);
    const savedChannel = await this.channelRepository.save(channel);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('channel:updated', { channel: savedChannel });

    return savedChannel;
  }

  async deleteChannel(id: string, userId: string): Promise<boolean> {
    const channel = await this.findChannelById(id);

    // Check if user is creator
    if (channel.createdById !== userId) {
      throw new ForbiddenException('Only channel creator can delete the channel');
    }

    await this.channelRepository.remove(channel);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('channel:deleted', { channelId: id });

    return true;
  }

  async addMemberToChannel(
    channelId: string,
    userIdToAdd: string,
    requesterId: string,
  ): Promise<Channel> {
    const channel = await this.findChannelById(channelId);

    // Check if requester is member or creator
    const isMember = channel.members?.some((m) => m.id === requesterId);
    if (!isMember && channel.createdById !== requesterId) {
      throw new ForbiddenException('You must be a member to add others');
    }

    // Check if user to add exists
    const userToAdd = await this.userRepository.findOne({
      where: { id: userIdToAdd },
    });
    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    // Check if already a member
    const alreadyMember = channel.members?.some((m) => m.id === userIdToAdd);
    if (alreadyMember) {
      throw new BadRequestException('User is already a member');
    }

    channel.members = [...(channel.members || []), userToAdd];
    const savedChannel = await this.channelRepository.save(channel);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('channel:member:added', {
      channelId,
      user: userToAdd,
    });

    return this.findChannelById(channelId);
  }

  async removeMemberFromChannel(
    channelId: string,
    userIdToRemove: string,
    requesterId: string,
  ): Promise<Channel> {
    const channel = await this.findChannelById(channelId);

    // Check if requester is creator or removing themselves
    if (
      channel.createdById !== requesterId &&
      userIdToRemove !== requesterId
    ) {
      throw new ForbiddenException(
        'Only creator can remove members or you can leave',
      );
    }

    channel.members =
      channel.members?.filter((m) => m.id !== userIdToRemove) || [];
    const savedChannel = await this.channelRepository.save(channel);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('channel:member:removed', {
      channelId,
      userId: userIdToRemove,
    });

    return this.findChannelById(channelId);
  }

  // ========== MESSAGE OPERATIONS ==========

  async createMessage(
    input: CreateMessageInput,
    userId: string,
  ): Promise<Message> {
    // Verify channel exists and user is member
    const channel = await this.findChannelById(input.channelId);
    const isMember =
      channel.type === ChannelType.PUBLIC ||
      channel.members?.some((m) => m.id === userId);

    if (!isMember) {
      throw new ForbiddenException('You must be a channel member to send messages');
    }

    // Create message
    const message = this.messageRepository.create({
      ...input,
      userId,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update channel last message time
    channel.lastMessageAt = new Date();
    await this.channelRepository.save(channel);

    // Load relations
    const fullMessage = await this.findMessageById(savedMessage.id);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('message:created', {
      message: fullMessage,
      channelId: input.channelId,
    });

    return fullMessage;
  }

  async findMessagesByChannelId(
    channelId: string,
    limit = 50,
    offset = 0,
  ): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { channelId },
      relations: ['user', 'replyTo', 'replyTo.user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return messages.reverse(); // Return in chronological order
  }

  async findMessageById(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['user', 'channel', 'replyTo', 'replyTo.user'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID "${id}" not found`);
    }

    return message;
  }

  async updateMessage(
    id: string,
    input: UpdateMessageInput,
    userId: string,
  ): Promise<Message> {
    const message = await this.findMessageById(id);

    // Check if user is the author
    if (message.userId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    message.content = input.content;
    message.isEdited = true;

    const savedMessage = await this.messageRepository.save(message);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('message:updated', {
      message: savedMessage,
      channelId: message.channelId,
    });

    return savedMessage;
  }

  async deleteMessage(id: string, userId: string): Promise<boolean> {
    const message = await this.findMessageById(id);

    // Check if user is the author or channel creator
    const channel = await this.findChannelById(message.channelId);
    if (message.userId !== userId && channel.createdById !== userId) {
      throw new ForbiddenException(
        'You can only delete your own messages or be channel creator',
      );
    }

    await this.messageRepository.softDelete(id);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('message:deleted', {
      messageId: id,
      channelId: message.channelId,
    });

    return true;
  }

  async addReaction(input: AddReactionInput, userId: string): Promise<Message> {
    const message = await this.findMessageById(input.messageId);

    // Initialize reactions if not exists
    if (!message.reactions) {
      message.reactions = {};
    }

    // Add user to emoji reactions
    if (!message.reactions[input.emoji]) {
      message.reactions[input.emoji] = [];
    }

    // Check if user already reacted with this emoji
    if (!message.reactions[input.emoji].includes(userId)) {
      message.reactions[input.emoji].push(userId);
    }

    const savedMessage = await this.messageRepository.save(message);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('message:reaction', {
      message: savedMessage,
      channelId: message.channelId,
      emoji: input.emoji,
      userId,
    });

    return savedMessage;
  }

  async removeReaction(
    input: AddReactionInput,
    userId: string,
  ): Promise<Message> {
    const message = await this.findMessageById(input.messageId);

    if (message.reactions && message.reactions[input.emoji]) {
      message.reactions[input.emoji] = message.reactions[input.emoji].filter(
        (id) => id !== userId,
      );

      // Remove emoji key if no reactions left
      if (message.reactions[input.emoji].length === 0) {
        delete message.reactions[input.emoji];
      }
    }

    const savedMessage = await this.messageRepository.save(message);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('message:reaction:removed', {
      message: savedMessage,
      channelId: message.channelId,
      emoji: input.emoji,
      userId,
    });

    return savedMessage;
  }

  // ========== TYPING INDICATOR ==========

  async emitTyping(channelId: string, userId: string): Promise<void> {
    const channel = await this.findChannelById(channelId);

    this.websocketGateway.emitToAll('user:typing', {
      channelId,
      userId,
    });
  }
}

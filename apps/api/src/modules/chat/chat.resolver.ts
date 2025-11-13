import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';
import {
  CreateChannelInput,
  UpdateChannelInput,
} from './dto/create-channel.dto';
import {
  CreateMessageInput,
  UpdateMessageInput,
  AddReactionInput,
} from './dto/create-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Resolver(() => Channel)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  // ========== CHANNEL QUERIES ==========

  @Query(() => [Channel], { name: 'channels' })
  @UseGuards(JwtAuthGuard)
  async getChannels(@CurrentUser() user: User): Promise<Channel[]> {
    return this.chatService.findAllChannels(user.id);
  }

  @Query(() => Channel, { name: 'channel' })
  @UseGuards(JwtAuthGuard)
  async getChannel(@Args('id', { type: () => ID }) id: string): Promise<Channel> {
    return this.chatService.findChannelById(id);
  }

  // ========== CHANNEL MUTATIONS ==========

  @Mutation(() => Channel)
  @UseGuards(JwtAuthGuard)
  async createChannel(
    @Args('input') input: CreateChannelInput,
    @CurrentUser() user: User,
  ): Promise<Channel> {
    return this.chatService.createChannel(input, user.id);
  }

  @Mutation(() => Channel)
  @UseGuards(JwtAuthGuard)
  async updateChannel(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateChannelInput,
    @CurrentUser() user: User,
  ): Promise<Channel> {
    return this.chatService.updateChannel(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteChannel(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.chatService.deleteChannel(id, user.id);
  }

  @Mutation(() => Channel)
  @UseGuards(JwtAuthGuard)
  async addChannelMember(
    @Args('channelId', { type: () => ID }) channelId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: User,
  ): Promise<Channel> {
    return this.chatService.addMemberToChannel(channelId, userId, user.id);
  }

  @Mutation(() => Channel)
  @UseGuards(JwtAuthGuard)
  async removeChannelMember(
    @Args('channelId', { type: () => ID }) channelId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: User,
  ): Promise<Channel> {
    return this.chatService.removeMemberFromChannel(channelId, userId, user.id);
  }

  // ========== MESSAGE QUERIES ==========

  @Query(() => [Message], { name: 'messages' })
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Args('channelId', { type: () => ID }) channelId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<Message[]> {
    return this.chatService.findMessagesByChannelId(
      channelId,
      limit,
      offset,
    );
  }

  @Query(() => Message, { name: 'message' })
  @UseGuards(JwtAuthGuard)
  async getMessage(@Args('id', { type: () => ID }) id: string): Promise<Message> {
    return this.chatService.findMessageById(id);
  }

  // ========== MESSAGE MUTATIONS ==========

  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard)
  async createMessage(
    @Args('input') input: CreateMessageInput,
    @CurrentUser() user: User,
  ): Promise<Message> {
    return this.chatService.createMessage(input, user.id);
  }

  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard)
  async updateMessage(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMessageInput,
    @CurrentUser() user: User,
  ): Promise<Message> {
    return this.chatService.updateMessage(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMessage(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.chatService.deleteMessage(id, user.id);
  }

  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard)
  async addReaction(
    @Args('input') input: AddReactionInput,
    @CurrentUser() user: User,
  ): Promise<Message> {
    return this.chatService.addReaction(input, user.id);
  }

  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard)
  async removeReaction(
    @Args('input') input: AddReactionInput,
    @CurrentUser() user: User,
  ): Promise<Message> {
    return this.chatService.removeReaction(input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async emitTyping(
    @Args('channelId', { type: () => ID }) channelId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.chatService.emitTyping(channelId, user.id);
    return true;
  }
}

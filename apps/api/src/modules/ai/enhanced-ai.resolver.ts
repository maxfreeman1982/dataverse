import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EnhancedAIService } from './enhanced-ai.service';
import { AIConversation } from './entities/ai-conversation.entity';
import { AIMessage } from './entities/ai-message.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import {
  CreateConversationInput,
  SendMessageInput,
  QueryDocumentsInput,
} from './dto/ai-chat.dto';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
class EnhancedAIResponse {
  @Field(() => AIMessage)
  message: AIMessage;

  @Field()
  conversationId: string;

  @Field(() => [String], { nullable: true })
  retrievedDocs?: string[];
}

@ObjectType()
class AIAnalytics {
  @Field(() => Int)
  totalConversations: number;

  @Field(() => Int)
  totalMessages: number;

  @Field(() => Int)
  totalTokens: number;

  @Field(() => Int)
  averageTokensPerMessage: number;

  @Field(() => Int)
  documentsIndexed: number;
}

@ObjectType()
class ReindexResult {
  @Field(() => Int)
  tables: number;

  @Field(() => Int)
  pages: number;

  @Field(() => Int)
  total: number;
}

@Resolver(() => AIConversation)
export class EnhancedAIResolver {
  constructor(private readonly enhancedAIService: EnhancedAIService) {}

  // ========== CONVERSATIONS ==========

  @Query(() => [AIConversation], { name: 'aiConversations' })
  @UseGuards(JwtAuthGuard)
  async getConversations(@CurrentUser() user: User): Promise<AIConversation[]> {
    return this.enhancedAIService.findAllConversations(user.id);
  }

  @Query(() => AIConversation, { name: 'aiConversation' })
  @UseGuards(JwtAuthGuard)
  async getConversation(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AIConversation> {
    return this.enhancedAIService.findConversationById(id);
  }

  @Mutation(() => AIConversation)
  @UseGuards(JwtAuthGuard)
  async createAIConversation(
    @Args('input') input: CreateConversationInput,
    @CurrentUser() user: User,
  ): Promise<AIConversation> {
    return this.enhancedAIService.createConversation(input.title, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteAIConversation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.enhancedAIService.deleteConversation(id, user.id);
  }

  @Mutation(() => AIConversation)
  @UseGuards(JwtAuthGuard)
  async togglePinConversation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<AIConversation> {
    return this.enhancedAIService.togglePinConversation(id, user.id);
  }

  // ========== MESSAGES ==========

  @Query(() => [AIMessage], { name: 'aiMessages' })
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AIMessage[]> {
    return this.enhancedAIService.getConversationMessages(conversationId, limit);
  }

  @Mutation(() => EnhancedAIResponse)
  @UseGuards(JwtAuthGuard)
  async sendAIMessage(
    @Args('input') input: SendMessageInput,
    @CurrentUser() user: User,
  ): Promise<EnhancedAIResponse> {
    const result = await this.enhancedAIService.sendMessage(
      input.conversationId,
      input.message,
      user.id,
      input.useRAG !== false, // Default to true
    );

    return {
      message: result.message,
      conversationId: result.conversationId,
      retrievedDocs: result.retrievedDocs,
    };
  }

  // ========== ANALYTICS & MANAGEMENT ==========

  @Query(() => AIAnalytics, { name: 'aiAnalytics' })
  @UseGuards(JwtAuthGuard)
  async getAnalytics(@CurrentUser() user: User): Promise<AIAnalytics> {
    return this.enhancedAIService.getAnalytics(user.id);
  }

  @Mutation(() => ReindexResult)
  @UseGuards(JwtAuthGuard)
  async reindexWorkspace(): Promise<ReindexResult> {
    return this.enhancedAIService.reindexWorkspace();
  }
}

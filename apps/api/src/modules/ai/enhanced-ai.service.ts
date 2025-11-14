import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AIConversation } from './entities/ai-conversation.entity';
import { AIMessage, MessageRole } from './entities/ai-message.entity';
import { RAGService } from './rag.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

export interface EnhancedAIResponse {
  message: AIMessage;
  conversationId: string;
  retrievedDocs?: string[];
}

@Injectable()
export class EnhancedAIService {
  private readonly logger = new Logger(EnhancedAIService.name);
  private openai: OpenAI | null = null;

  constructor(
    private configService: ConfigService,
    @InjectRepository(AIConversation)
    private readonly conversationRepository: Repository<AIConversation>,
    @InjectRepository(AIMessage)
    private readonly messageRepository: Repository<AIMessage>,
    private readonly ragService: RAGService,
    private readonly websocketGateway: WebsocketGateway,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('Enhanced AI Service initialized with RAG');
    } else {
      this.logger.warn('OPENAI_API_KEY not configured');
    }
  }

  // ========== CONVERSATION MANAGEMENT ==========

  async createConversation(
    title: string,
    userId: string,
  ): Promise<AIConversation> {
    const conversation = this.conversationRepository.create({
      title,
      userId,
    });

    const saved = await this.conversationRepository.save(conversation);

    // Emit event
    this.websocketGateway.emitToAll('ai:conversation:created', {
      conversation: saved,
    });

    return saved;
  }

  async findAllConversations(userId: string): Promise<AIConversation[]> {
    return this.conversationRepository.find({
      where: { userId },
      order: {
        isPinned: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async findConversationById(id: string): Promise<AIConversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }

    return conversation;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    const conversation = await this.findConversationById(id);

    if (conversation.userId !== userId) {
      throw new NotFoundException('Unauthorized');
    }

    await this.conversationRepository.remove(conversation);

    this.websocketGateway.emitToAll('ai:conversation:deleted', {
      conversationId: id,
    });

    return true;
  }

  async togglePinConversation(
    id: string,
    userId: string,
  ): Promise<AIConversation> {
    const conversation = await this.findConversationById(id);

    if (conversation.userId !== userId) {
      throw new NotFoundException('Unauthorized');
    }

    conversation.isPinned = !conversation.isPinned;
    return this.conversationRepository.save(conversation);
  }

  // ========== MESSAGE MANAGEMENT ==========

  async getConversationMessages(
    conversationId: string,
    limit = 100,
  ): Promise<AIMessage[]> {
    return this.messageRepository.find({
      where: { conversationId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * Send a message and get AI response with RAG
   */
  async sendMessage(
    conversationId: string,
    message: string,
    userId: string,
    useRAG = true,
  ): Promise<EnhancedAIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    // Verify conversation exists
    const conversation = await this.findConversationById(conversationId);

    // Save user message
    const userMessage = this.messageRepository.create({
      conversationId,
      userId,
      role: MessageRole.USER,
      content: message,
    });
    await this.messageRepository.save(userMessage);

    // Get conversation history
    const history = await this.getConversationMessages(conversationId, 20);

    // Build context using RAG
    let ragContext = '';
    let retrievedDocs: string[] = [];

    if (useRAG) {
      try {
        ragContext = await this.ragService.getRelevantContext(message, 3);
        const searchResults = await this.ragService.searchDocuments(message, 3);
        retrievedDocs = searchResults.map((r) => r.document.id);
      } catch (error) {
        this.logger.warn('RAG search failed, continuing without context', error);
      }
    }

    // Build system prompt
    const systemPrompt = `You are DataVerse OS AI Assistant, an intelligent assistant for a sovereign workspace platform.

You have access to the following information from the user's workspace:

${ragContext}

Your capabilities:
- Answer questions about the workspace data
- Provide insights and analytics
- Suggest improvements and optimizations
- Help with data organization
- Assist with building pages and applications

Guidelines:
- Be concise and helpful
- Use the workspace context when relevant
- If you don't have enough information, ask clarifying questions
- Suggest actionable next steps when appropriate`;

    // Build messages array from history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history
        .filter((m) => m.role !== MessageRole.SYSTEM)
        .map(
          (m) =>
            ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            } as OpenAI.Chat.ChatCompletionMessageParam),
        ),
    ];

    // Get AI response
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No response';
    const tokenCount =
      completion.usage?.total_tokens || message.length + aiResponse.length;

    // Save AI response
    const assistantMessage = this.messageRepository.create({
      conversationId,
      userId,
      role: MessageRole.ASSISTANT,
      content: aiResponse,
      retrievedDocs: useRAG ? retrievedDocs : null,
      tokenCount,
      metadata: {
        model: 'gpt-4-turbo-preview',
        usedRAG: useRAG,
        temperature: 0.7,
      },
    });

    const savedAssistant = await this.messageRepository.save(assistantMessage);

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('ai:message:created', {
      message: savedAssistant,
      conversationId,
    });

    return {
      message: savedAssistant,
      conversationId,
      retrievedDocs: useRAG ? retrievedDocs : undefined,
    };
  }

  /**
   * Get AI analytics for a user
   */
  async getAnalytics(userId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    totalTokens: number;
    averageTokensPerMessage: number;
    documentsIndexed: number;
  }> {
    const conversations = await this.conversationRepository.find({
      where: { userId },
    });

    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.conversation', 'conversation')
      .where('conversation.userId = :userId', { userId })
      .getMany();

    const totalTokens = messages.reduce((sum, m) => sum + (m.tokenCount || 0), 0);

    const embeddingStats = await this.ragService.getStats();

    return {
      totalConversations: conversations.length,
      totalMessages: messages.length,
      totalTokens,
      averageTokensPerMessage:
        messages.length > 0 ? Math.round(totalTokens / messages.length) : 0,
      documentsIndexed: embeddingStats.total,
    };
  }

  /**
   * Reindex all workspace content
   */
  async reindexWorkspace(): Promise<{
    tables: number;
    pages: number;
    total: number;
  }> {
    const [tables, pages] = await Promise.all([
      this.ragService.indexAllTables(),
      this.ragService.indexAllPages(),
    ]);

    return {
      tables,
      pages,
      total: tables + pages,
    };
  }
}

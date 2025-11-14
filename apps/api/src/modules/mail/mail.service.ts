import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Email, EmailStatus, EmailFolder } from './entities/email.entity';
import { EmailThread } from './entities/email-thread.entity';
import {
  CreateEmailInput,
  UpdateEmailInput,
  GetEmailsInput,
} from './dto/email.dto';
import { MailAIService } from './mail-ai.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(Email)
    private emailRepository: Repository<Email>,
    @InjectRepository(EmailThread)
    private threadRepository: Repository<EmailThread>,
    private mailAIService: MailAIService,
    private websocketGateway: WebsocketGateway,
  ) {}

  async createEmail(
    input: CreateEmailInput,
    userId: string,
    userEmail: string,
    userName?: string,
  ): Promise<Email> {
    let thread: EmailThread | null = null;

    // Find or create thread
    if (input.threadId) {
      thread = await this.threadRepository.findOne({
        where: { id: input.threadId, userId },
      });
    } else {
      // Create new thread
      const participants = [userEmail, ...input.toAddresses];
      thread = this.threadRepository.create({
        userId,
        subject: input.subject,
        participants: Array.from(new Set(participants)),
        emailCount: 0,
        unreadCount: 0,
      });
      thread = await this.threadRepository.save(thread);
    }

    const email = this.emailRepository.create({
      ...input,
      userId,
      fromAddress: userEmail,
      fromName: userName,
      threadId: thread.id,
      status: input.isDraft ? EmailStatus.DRAFT : EmailStatus.SENT,
      folder: input.isDraft ? EmailFolder.DRAFTS : EmailFolder.SENT,
      isRead: true,
      sentAt: input.isDraft ? undefined : new Date(),
    });

    const savedEmail = await this.emailRepository.save(email);

    // Update thread
    thread.emailCount += 1;
    thread.lastEmailAt = new Date();
    await this.threadRepository.save(thread);

    // AI Analysis (async, non-blocking)
    if (!input.isDraft) {
      this.analyzeEmailWithAI(savedEmail.id, input.subject, input.body);
    }

    const fullEmail = await this.getEmailById(savedEmail.id);

    this.websocketGateway.emitToUser(userId, 'email:created', {
      email: fullEmail,
    });

    return fullEmail;
  }

  async getEmailById(id: string): Promise<Email> {
    const email = await this.emailRepository.findOne({
      where: { id },
      relations: ['user', 'thread'],
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    return email;
  }

  async getEmails(input: GetEmailsInput, userId: string): Promise<Email[]> {
    const query = this.emailRepository
      .createQueryBuilder('email')
      .leftJoinAndSelect('email.user', 'user')
      .leftJoinAndSelect('email.thread', 'thread')
      .where('email.userId = :userId', { userId });

    if (input.folder) {
      query.andWhere('email.folder = :folder', { folder: input.folder });
    }

    if (input.isRead !== undefined) {
      query.andWhere('email.isRead = :isRead', { isRead: input.isRead });
    }

    if (input.isStarred !== undefined) {
      query.andWhere('email.isStarred = :isStarred', {
        isStarred: input.isStarred,
      });
    }

    if (input.threadId) {
      query.andWhere('email.threadId = :threadId', { threadId: input.threadId });
    }

    if (input.search) {
      query.andWhere(
        '(email.subject ILIKE :search OR email.body ILIKE :search OR email.fromAddress ILIKE :search)',
        { search: `%${input.search}%` },
      );
    }

    query.orderBy('email.createdAt', 'DESC');

    if (input.limit) {
      query.take(input.limit);
    }

    if (input.offset) {
      query.skip(input.offset);
    }

    return query.getMany();
  }

  async updateEmail(input: UpdateEmailInput, userId: string): Promise<Email> {
    const email = await this.emailRepository.findOne({
      where: { id: input.id, userId },
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    if (input.isRead !== undefined) {
      email.isRead = input.isRead;

      // Update thread unread count
      if (email.threadId) {
        const thread = await this.threadRepository.findOne({
          where: { id: email.threadId },
        });
        if (thread) {
          if (input.isRead) {
            thread.unreadCount = Math.max(0, thread.unreadCount - 1);
          } else {
            thread.unreadCount += 1;
          }
          await this.threadRepository.save(thread);
        }
      }
    }

    if (input.isStarred !== undefined) {
      email.isStarred = input.isStarred;
    }

    if (input.isImportant !== undefined) {
      email.isImportant = input.isImportant;
    }

    if (input.folder !== undefined) {
      email.folder = input.folder;
    }

    if (input.labels !== undefined) {
      email.labels = input.labels;
    }

    const updated = await this.emailRepository.save(email);

    this.websocketGateway.emitToUser(userId, 'email:updated', {
      email: updated,
    });

    return updated;
  }

  async deleteEmail(id: string, userId: string): Promise<boolean> {
    const email = await this.emailRepository.findOne({
      where: { id, userId },
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    // Soft delete: move to trash
    email.folder = EmailFolder.TRASH;
    await this.emailRepository.save(email);

    this.websocketGateway.emitToUser(userId, 'email:deleted', { emailId: id });

    return true;
  }

  async getThreads(userId: string, limit = 50): Promise<EmailThread[]> {
    return this.threadRepository.find({
      where: { userId },
      relations: ['user', 'emails'],
      order: { lastEmailAt: 'DESC' },
      take: limit,
    });
  }

  async generateAIReply(
    emailId: string,
    replyIntent: string,
    userId: string,
  ): Promise<string> {
    const email = await this.emailRepository.findOne({
      where: { id: emailId, userId },
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    return this.mailAIService.generateReply(
      email.subject,
      email.body,
      replyIntent,
    );
  }

  async composeWithAI(
    prompt: string,
    userId: string,
  ): Promise<{ subject: string; body: string }> {
    return this.mailAIService.composeEmail(prompt);
  }

  private async analyzeEmailWithAI(
    emailId: string,
    subject: string,
    body: string,
  ): Promise<void> {
    try {
      const analysis = await this.mailAIService.analyzeEmail(subject, body);

      await this.emailRepository.update(emailId, {
        aiSummary: analysis.summary,
        aiCategory: analysis.category,
        aiSentimentScore: analysis.sentimentScore,
        aiSuggestedReplies: analysis.suggestedReplies,
      });
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  }
}

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { MailService } from './mail.service';
import { Email } from './entities/email.entity';
import { EmailThread } from './entities/email-thread.entity';
import {
  CreateEmailInput,
  UpdateEmailInput,
  GetEmailsInput,
} from './dto/email.dto';

@Resolver(() => Email)
@UseGuards(GqlAuthGuard)
export class MailResolver {
  constructor(private mailService: MailService) {}

  @Mutation(() => Email)
  async createEmail(
    @Args('input') input: CreateEmailInput,
    @CurrentUser() user: User,
  ): Promise<Email> {
    return this.mailService.createEmail(
      input,
      user.id,
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    );
  }

  @Query(() => Email)
  async email(@Args('id', { type: () => ID }) id: string): Promise<Email> {
    return this.mailService.getEmailById(id);
  }

  @Query(() => [Email])
  async emails(
    @Args('input', { nullable: true }) input: GetEmailsInput,
    @CurrentUser() user: User,
  ): Promise<Email[]> {
    return this.mailService.getEmails(input || {}, user.id);
  }

  @Mutation(() => Email)
  async updateEmail(
    @Args('input') input: UpdateEmailInput,
    @CurrentUser() user: User,
  ): Promise<Email> {
    return this.mailService.updateEmail(input, user.id);
  }

  @Mutation(() => Boolean)
  async deleteEmail(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.mailService.deleteEmail(id, user.id);
  }

  @Query(() => [EmailThread])
  async emailThreads(@CurrentUser() user: User): Promise<EmailThread[]> {
    return this.mailService.getThreads(user.id);
  }

  @Mutation(() => String)
  async generateAIReply(
    @Args('emailId', { type: () => ID }) emailId: string,
    @Args('replyIntent') replyIntent: string,
    @CurrentUser() user: User,
  ): Promise<string> {
    return this.mailService.generateAIReply(emailId, replyIntent, user.id);
  }

  @Mutation(() => Email)
  async composeEmailWithAI(
    @Args('prompt') prompt: string,
    @CurrentUser() user: User,
  ): Promise<Partial<Email>> {
    const result = await this.mailService.composeWithAI(prompt, user.id);
    return {
      subject: result.subject,
      body: result.body,
    } as any;
  }
}

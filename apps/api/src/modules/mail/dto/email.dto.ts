import { InputType, Field, ID } from '@nestjs/graphql';
import { EmailFolder, EmailPriority } from '../entities/email.entity';

@InputType()
export class CreateEmailInput {
  @Field(() => [String])
  toAddresses: string[];

  @Field(() => [String], { nullable: true })
  ccAddresses?: string[];

  @Field(() => [String], { nullable: true })
  bccAddresses?: string[];

  @Field()
  subject: string;

  @Field()
  body: string;

  @Field({ nullable: true })
  htmlBody?: string;

  @Field(() => EmailPriority, { nullable: true })
  priority?: EmailPriority;

  @Field(() => ID, { nullable: true })
  threadId?: string;

  @Field({ nullable: true })
  isDraft?: boolean;
}

@InputType()
export class UpdateEmailInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  isRead?: boolean;

  @Field({ nullable: true })
  isStarred?: boolean;

  @Field({ nullable: true })
  isImportant?: boolean;

  @Field(() => EmailFolder, { nullable: true })
  folder?: EmailFolder;

  @Field(() => [String], { nullable: true })
  labels?: string[];
}

@InputType()
export class GetEmailsInput {
  @Field(() => EmailFolder, { nullable: true })
  folder?: EmailFolder;

  @Field({ nullable: true })
  isRead?: boolean;

  @Field({ nullable: true })
  isStarred?: boolean;

  @Field(() => ID, { nullable: true })
  threadId?: string;

  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  limit?: number;

  @Field({ nullable: true })
  offset?: number;
}

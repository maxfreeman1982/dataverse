import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IsString, IsOptional, MinLength } from 'class-validator';

@InputType()
export class CreateMessageInput {
  @Field()
  @IsString()
  channelId: string;

  @Field()
  @IsString()
  @MinLength(1)
  content: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  attachments?: Record<string, any>[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  mentions?: Record<string, any>[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  replyToId?: string;
}

@InputType()
export class UpdateMessageInput {
  @Field()
  @IsString()
  @MinLength(1)
  content: string;
}

@InputType()
export class AddReactionInput {
  @Field()
  @IsString()
  messageId: string;

  @Field()
  @IsString()
  emoji: string;
}

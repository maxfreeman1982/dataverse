import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, MinLength } from 'class-validator';

@InputType()
export class CreateConversationInput {
  @Field()
  @IsString()
  @MinLength(1)
  title: string;
}

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  conversationId: string;

  @Field()
  @IsString()
  @MinLength(1)
  message: string;

  @Field({ nullable: true })
  @IsOptional()
  useRAG?: boolean;
}

@InputType()
export class QueryDocumentsInput {
  @Field()
  @IsString()
  @MinLength(1)
  query: string;

  @Field({ nullable: true })
  @IsOptional()
  limit?: number;
}

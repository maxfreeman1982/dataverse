import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ObjectType()
class AIResponseType {
  @Field()
  answer: string;

  @Field({ nullable: true })
  context?: string;

  @Field(() => [String], { nullable: true })
  suggestedActions?: string[];
}

@Resolver()
export class AIResolver {
  constructor(private readonly aiService: AIService) {}

  @Mutation(() => AIResponseType)
  @UseGuards(JwtAuthGuard)
  async aiChat(
    @Args('message') message: string,
    @CurrentUser() user: User,
  ): Promise<AIResponseType> {
    return this.aiService.chat(message, user.id);
  }

  @Query(() => AIResponseType)
  @UseGuards(JwtAuthGuard)
  async aiQueryData(
    @Args('question') question: string,
    @Args('tableId') tableId: string,
    @CurrentUser() user: User,
  ): Promise<AIResponseType> {
    return this.aiService.queryData(question, tableId, user.id);
  }

  @Query(() => AIResponseType)
  @UseGuards(JwtAuthGuard)
  async aiSuggestColumns(
    @Args('tableName') tableName: string,
    @Args('description') description: string,
  ): Promise<AIResponseType> {
    return this.aiService.suggestColumns(tableName, description);
  }
}

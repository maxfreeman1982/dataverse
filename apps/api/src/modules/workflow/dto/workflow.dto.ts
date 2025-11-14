import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { TriggerType } from '../entities/workflow.entity';

@InputType()
export class CreateWorkflowInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String)
  @IsEnum(TriggerType)
  triggerType: TriggerType;

  @Field(() => GraphQLJSONObject)
  triggerConfig: Record<string, any>;
}

@InputType()
export class UpdateWorkflowInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  nodes?: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
  }>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  edges?: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  triggerConfig?: Record<string, any>;
}

@InputType()
export class ExecuteWorkflowInput {
  @Field()
  @IsString()
  workflowId: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  triggerData?: Record<string, any>;
}

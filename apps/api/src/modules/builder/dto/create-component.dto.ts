import { InputType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IsString, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';
import { ComponentType } from '../entities/page-component.entity';

@InputType()
export class CreateComponentInput {
  @Field()
  @IsString()
  pageId: string;

  @Field(() => String)
  @IsEnum(ComponentType)
  type: ComponentType;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  properties: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  style?: Record<string, any>;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;
}

@InputType()
export class UpdateComponentInput {
  @Field(() => String, { nullable: true })
  @IsEnum(ComponentType)
  @IsOptional()
  type?: ComponentType;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  style?: Record<string, any>;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;
}

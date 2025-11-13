import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { PageStatus } from '../entities/page.entity';

@InputType()
export class CreatePageInput {
  @Field()
  @IsString()
  @MinLength(1)
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsString()
  @MinLength(1)
  slug: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  coverImage?: string;
}

@InputType()
export class UpdatePageInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;

  @Field(() => PageStatus, { nullable: true })
  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  coverImage?: string;
}

import { InputType, Field, Float, Int, ObjectType, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, Min, IsEnum, IsDate, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectCategory, ProjectStatus } from '../entities/project.entity';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateProjectInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @Field(() => ProjectCategory)
  @IsEnum(ProjectCategory)
  category: ProjectCategory;

  @Field()
  @IsString()
  spvName: string;

  @Field()
  @IsString()
  spvRegistrationNumber: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  spvCountry?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(1000)
  targetAmount: number;

  @Field(() => Float)
  @IsNumber()
  @Min(100)
  minimumInvestment: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  expectedReturn: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  durationMonths: number;

  @Field()
  @Type(() => Date)
  startDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  documents?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  milestones?: Record<string, any>[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  financialDetails?: Record<string, any>;

  @Field()
  @IsString()
  seriesCode: string;
}

@InputType()
export class UpdateProjectInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @Field(() => ProjectStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  documents?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  milestones?: Record<string, any>[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  financialDetails?: Record<string, any>;
}

@InputType()
export class ProjectFilterInput {
  @Field(() => ProjectCategory, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectCategory)
  category?: ProjectCategory;

  @Field(() => ProjectStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minInvestment?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  maxInvestment?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minReturn?: number;
}

@ObjectType()
export class ProjectStats {
  @Field(() => Int)
  totalProjects: number;

  @Field(() => Int)
  activeProjects: number;

  @Field(() => Float)
  totalFundsRaised: number;

  @Field(() => Float)
  averageReturn: number;

  @Field(() => Int)
  totalInvestors: number;
}

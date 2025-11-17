import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

@InputType()
export class CreateMatchInput {
  @Field()
  @IsDateString()
  date: Date;

  @Field()
  @IsUUID()
  homeTeamId: string;

  @Field()
  @IsUUID()
  awayTeamId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  venue?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  competition?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  season?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  matchday?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  homeFormation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  awayFormation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  environment?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coachGoals?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

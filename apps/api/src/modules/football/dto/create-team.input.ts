import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsObject } from 'class-validator';

@InputType()
export class CreateTeamInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  stadium?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coach?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  formation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tacticalStyle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  philosophyOfPlay?: any;

  @Field(() => String, { nullable: true })
  @IsOptional()
  colors?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  league?: string;
}

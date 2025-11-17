import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';

@InputType()
export class CreatePlayerInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  photo?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  jerseyNumber?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  position?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  preferredFoot?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  height?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  weight?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  age?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  biometrics?: any;

  @Field(() => String, { nullable: true })
  @IsOptional()
  attributes?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}

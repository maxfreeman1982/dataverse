import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';

@InputType()
export class CreateChannelInput {
  @Field()
  @IsString()
  @MinLength(1)
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ChannelType, { nullable: true })
  @IsEnum(ChannelType)
  @IsOptional()
  type?: ChannelType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  memberIds?: string[];
}

@InputType()
export class UpdateChannelInput {
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
  icon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  coverImage?: string;
}

import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { PluginCategory, PluginStatus } from '../entities/plugin.entity';

@InputType()
export class CreatePluginInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field()
  version: string;

  @Field()
  author: string;

  @Field(() => PluginCategory)
  category: PluginCategory;

  @Field({ nullable: true })
  iconUrl?: string;

  @Field(() => [String], { nullable: true })
  screenshots?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field()
  downloadUrl: string;

  @Field({ nullable: true })
  homepageUrl?: string;

  @Field({ nullable: true })
  documentationUrl?: string;

  @Field({ nullable: true })
  repositoryUrl?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  permissions?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  config?: Record<string, any>;
}

@InputType()
export class UpdatePluginInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field({ nullable: true })
  version?: string;

  @Field(() => PluginCategory, { nullable: true })
  category?: PluginCategory;

  @Field(() => PluginStatus, { nullable: true })
  status?: PluginStatus;

  @Field({ nullable: true })
  iconUrl?: string;

  @Field(() => [String], { nullable: true })
  screenshots?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  downloadUrl?: string;

  @Field({ nullable: true })
  homepageUrl?: string;

  @Field({ nullable: true })
  documentationUrl?: string;

  @Field({ nullable: true })
  repositoryUrl?: string;
}

@InputType()
export class InstallPluginInput {
  @Field(() => ID)
  pluginId: string;
}

@InputType()
export class CreateReviewInput {
  @Field(() => ID)
  pluginId: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;
}

@InputType()
export class GetPluginsInput {
  @Field(() => PluginCategory, { nullable: true })
  category?: PluginCategory;

  @Field(() => PluginStatus, { nullable: true })
  status?: PluginStatus;

  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  featured?: boolean;

  @Field({ nullable: true })
  verified?: boolean;

  @Field({ nullable: true })
  limit?: number;

  @Field({ nullable: true })
  offset?: number;
}

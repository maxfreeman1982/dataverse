import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { DocumentStatus, DocumentVisibility } from '../entities/document.entity';

// Document DTOs
@InputType()
export class CreateDocumentInput {
  @Field()
  title: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  content?: any;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
export class UpdateDocumentInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  content?: any;

  @Field(() => DocumentStatus, { nullable: true })
  status?: DocumentStatus;

  @Field(() => DocumentVisibility, { nullable: true })
  visibility?: DocumentVisibility;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

// Spreadsheet DTOs
@InputType()
export class CreateSpreadsheetInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;
}

@InputType()
export class UpdateSpreadsheetInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  sheets?: any;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

// Presentation DTOs
@InputType()
export class CreatePresentationInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  theme?: string;
}

@InputType()
export class UpdatePresentationInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  slides?: any;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  theme?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

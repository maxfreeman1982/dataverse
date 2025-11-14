import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

export enum DocumentType {
  TABLE = 'table',
  PAGE = 'page',
  MESSAGE = 'message',
  RECORD = 'record',
}

@ObjectType()
@Entity('document_embeddings')
@Index(['documentType', 'documentId'])
export class DocumentEmbedding {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({
    type: 'enum',
    enum: DocumentType,
    name: 'document_type',
  })
  documentType: DocumentType;

  @Field()
  @Column({ name: 'document_id' })
  documentId: string;

  @Field()
  @Column({ type: 'text' })
  content: string;

  // Store as JSON array for PostgreSQL without pgvector extension
  @Column({ type: 'jsonb', nullable: true })
  embedding?: number[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

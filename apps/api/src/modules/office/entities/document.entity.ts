import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../auth/entities/user.entity';

export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum DocumentVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
}

registerEnumType(DocumentStatus, {
  name: 'DocumentStatus',
});

registerEnumType(DocumentVisibility, {
  name: 'DocumentVisibility',
});

@ObjectType()
@Entity('documents')
export class Document {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'jsonb', default: '{}' })
  content: any; // TipTap/ProseMirror JSON content

  @Field()
  @Column({ name: 'created_by_id' })
  createdById: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User)
  @JoinTable({
    name: 'document_collaborators',
    joinColumn: { name: 'document_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  collaborators?: User[];

  @Field(() => DocumentStatus)
  @Column({
    type: 'simple-enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Field(() => DocumentVisibility)
  @Column({
    type: 'simple-enum',
    enum: DocumentVisibility,
    default: DocumentVisibility.PRIVATE,
  })
  visibility: DocumentVisibility;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Field()
  @Column({ default: 0, name: 'word_count' })
  wordCount: number;

  @Field()
  @Column({ default: 0, name: 'character_count' })
  characterCount: number;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'last_edited_by_id' })
  lastEditedById?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'last_edited_by_id' })
  lastEditedBy?: User;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Page } from './page.entity';

export enum ComponentType {
  TEXT = 'text',
  HEADING = 'heading',
  BUTTON = 'button',
  INPUT = 'input',
  FORM = 'form',
  TABLE = 'table',
  CARD = 'card',
  CONTAINER = 'container',
  IMAGE = 'image',
  DIVIDER = 'divider',
  CHART = 'chart',
  LIST = 'list',
}

@ObjectType()
@Entity('page_components')
export class PageComponent {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'page_id' })
  pageId: string;

  @ManyToOne(() => Page, (page) => page.components, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @Field()
  @Column({
    type: 'enum',
    enum: ComponentType,
  })
  type: ComponentType;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'jsonb', default: {} })
  properties: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  style?: Record<string, any>;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  order: number;

  @Field({ nullable: true })
  @Column({ name: 'parent_id', nullable: true })
  parentId?: string;

  @Field(() => [PageComponent], { nullable: true })
  children?: PageComponent[];
}

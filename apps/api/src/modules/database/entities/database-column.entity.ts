import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { DatabaseTable } from './database-table.entity';

export enum ColumnType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  RELATION = 'relation',
  FILE = 'file',
  JSON = 'json',
  RICH_TEXT = 'rich_text',
}

registerEnumType(ColumnType, {
  name: 'ColumnType',
});

@ObjectType()
@Entity('database_columns')
export class DatabaseColumn {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  slug: string;

  @Field(() => ColumnType)
  @Column({
    type: 'enum',
    enum: ColumnType,
    default: ColumnType.TEXT,
  })
  type: ColumnType;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({ default: false })
  isRequired: boolean;

  @Field()
  @Column({ default: false })
  isUnique: boolean;

  @Field()
  @Column({ default: true })
  isVisible: boolean;

  @Field()
  @Column({ type: 'int', default: 0 })
  order: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  defaultValue: string;

  @Field()
  @Column({ type: 'jsonb', default: {} })
  options: Record<string, any>;

  @ManyToOne(() => DatabaseTable, (table) => table.columns, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'table_id' })
  table: DatabaseTable;

  @Column({ name: 'table_id' })
  tableId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { DatabaseTable } from './database-table.entity';
import { User } from '../../users/user.entity';

@ObjectType()
@Entity('database_records')
@Index(['tableId', 'createdAt'])
export class DatabaseRecord {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DatabaseTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: DatabaseTable;

  @Column({ name: 'table_id' })
  tableId: string;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;

  @Column({ name: 'updated_by_id', nullable: true })
  updatedById: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

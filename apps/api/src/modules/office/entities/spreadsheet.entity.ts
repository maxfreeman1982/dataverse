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
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../auth/entities/user.entity';

@ObjectType()
@Entity('spreadsheets')
export class Spreadsheet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'simple-json', default: '[]' })
  sheets: Array<{
    id: string;
    name: string;
    cells: Record<string, any>; // e.g., { "A1": { value: "Hello", formula: "", style: {} } }
    rowCount: number;
    columnCount: number;
  }>;

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
    name: 'spreadsheet_collaborators',
    joinColumn: { name: 'spreadsheet_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  collaborators?: User[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  tags?: string[];

  @Field(() => Int)
  @Column({ default: 1, name: 'sheet_count' })
  sheetCount: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

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
@Entity('presentations')
export class Presentation {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'jsonb', default: '[]' })
  slides: Array<{
    id: string;
    order: number;
    content: any; // TipTap/ProseMirror JSON or custom slide format
    layout: string; // title, content, two-column, image, etc.
    background?: string;
    transition?: string;
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
    name: 'presentation_collaborators',
    joinColumn: { name: 'presentation_id' },
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
  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Field(() => Int)
  @Column({ default: 0, name: 'slide_count' })
  slideCount: number;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'theme' })
  theme?: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';
import { Plugin } from './plugin.entity';

@ObjectType()
@Entity('plugin_reviews')
export class PluginReview {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'plugin_id' })
  pluginId: string;

  @Field(() => Plugin)
  @ManyToOne(() => Plugin, (plugin) => plugin.reviews)
  @JoinColumn({ name: 'plugin_id' })
  plugin: Plugin;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => Int)
  @Column({ type: 'int' })
  rating: number; // 1-5

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

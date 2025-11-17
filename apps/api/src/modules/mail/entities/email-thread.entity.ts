import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../users/user.entity';
import { Email } from './email.entity';

@ObjectType()
@Entity('email_threads')
export class EmailThread {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column()
  subject: string;

  @Field(() => [String])
  @Column({ type: 'simple-json' })
  participants: string[];

  @Field(() => [Email], { nullable: true })
  @OneToMany(() => Email, (email) => email.thread)
  emails?: Email[];

  @Field(() => Int)
  @Column({ default: 0, name: 'email_count' })
  emailCount: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'unread_count' })
  unreadCount: number;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'last_email_at' })
  lastEmailAt?: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

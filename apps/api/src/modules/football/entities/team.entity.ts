import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Player } from './player.entity';
import { Match } from './match.entity';

@ObjectType()
@Entity('teams')
export class Team {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  stadium?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  coach?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  formation?: string; // ex: "4-3-3", "3-5-2"

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  tacticalStyle?: string; // ex: "possession", "counter-attack", "high-press"

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  philosophyOfPlay?: {
    buildupStyle?: string;
    defensiveApproach?: string;
    pressingIntensity?: number;
    possessionTarget?: number;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  colors?: {
    primary?: string;
    secondary?: string;
  };

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  country?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  league?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  statistics?: {
    wins?: number;
    draws?: number;
    losses?: number;
    goalsScored?: number;
    goalsConceded?: number;
  };

  // Relations
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Field(() => [Player], { nullable: true })
  @OneToMany(() => Player, (player) => player.team, { cascade: true })
  players?: Player[];

  @Field(() => [Match], { nullable: true })
  @OneToMany(() => Match, (match) => match.homeTeam)
  homeMatches?: Match[];

  @Field(() => [Match], { nullable: true })
  @OneToMany(() => Match, (match) => match.awayTeam)
  awayMatches?: Match[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

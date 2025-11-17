import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Match } from './match.entity';

@ObjectType()
@Entity('match_events')
@Index(['matchId', 'timestamp'])
export class MatchEvent {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Float)
  @Column({ type: 'float' })
  timestamp: number; // seconds from match start

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  minute?: number; // match minute

  @Field()
  @Column()
  type: string; // pass, shot, tackle, interception, duel, clearance, cross, corner, free-kick, throw-in, goal-kick, substitution, card, goal, offside, foul, save, etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  team?: string; // home or away

  @Field({ nullable: true })
  @Column({ nullable: true })
  playerId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  playerName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedPlayerId?: string; // for passes (receiver), assists, etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedPlayerName?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  location?: {
    x: number; // meters or percentage
    y: number;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  endLocation?: {
    x: number; // for passes, shots, etc.
    y: number;
  };

  @Field({ nullable: true })
  @Column({ nullable: true })
  outcome?: string; // success, fail, blocked, saved, etc.

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  details?: {
    // Pass details
    passType?: string; // short, long, through, cross, corner, free-kick
    passLength?: number; // meters
    passAngle?: number; // degrees
    bodyPart?: string; // left foot, right foot, head, chest

    // Shot details
    shotType?: string; // shot, header, volley, free-kick, penalty
    xG?: number; // expected goals (0-1)
    goalmouth?: { x: number; y: number }; // location on goal

    // Duel details
    duelType?: string; // aerial, ground, tackle
    won?: boolean;

    // Card details
    cardType?: string; // yellow, red

    // Other
    zone?: string; // defensive-third, middle-third, attacking-third
    underPressure?: boolean;
    assistType?: string; // pass, cross, through-ball, etc.
  };

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  videoTimestamp?: string; // timestamp in video

  // Relations
  @Field(() => Match)
  @ManyToOne(() => Match, (match) => match.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column()
  matchId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}

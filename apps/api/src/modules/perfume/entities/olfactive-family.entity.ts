import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Ingredient } from './ingredient.entity';

@ObjectType()
@Entity('olfactive_families')
export class OlfactiveFamily {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column()
  category: string; // 'classic', 'niche', 'regional', 'rare'

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  characteristics: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  synonyms: string[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  region: string; // 'global', 'africa', 'asia', 'europe', 'americas', 'oceania'

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', default: 0 })
  popularity: number;

  @OneToMany(() => Ingredient, ingredient => ingredient.olfactiveFamily)
  ingredients: Ingredient[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

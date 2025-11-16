import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Ingredient } from './ingredient.entity';

@ObjectType()
@Entity('allergens')
export class Allergen {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column()
  casNumber: string; // CAS Registry Number

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field(() => Float)
  @Column('float')
  maxConcentrationLeaveOn: number; // Maximum % for leave-on products

  @Field(() => Float)
  @Column('float')
  maxConcentrationRinseOff: number; // Maximum % for rinse-off products

  @Field(() => Float)
  @Column('float')
  labelingThreshold: number; // Threshold % requiring labeling

  @Field()
  @Column({ default: true })
  requiresLabeling: boolean;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  regulatoryNotes: string;

  @ManyToMany(() => Ingredient, ingredient => ingredient.allergens)
  ingredients: Ingredient[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

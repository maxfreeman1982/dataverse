import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Formula } from './formula.entity';
import { Ingredient } from './ingredient.entity';

@ObjectType()
@Entity('formula_ingredients')
export class FormulaIngredient {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Formula)
  @ManyToOne(() => Formula, formula => formula.ingredients, { onDelete: 'CASCADE' })
  formula: Formula;

  @Field(() => Ingredient)
  @ManyToOne(() => Ingredient, ingredient => ingredient.formulaIngredients)
  ingredient: Ingredient;

  @Field(() => Float)
  @Column('float')
  percentage: number; // Percentage in the fragrance concentrate

  @Field(() => Float)
  @Column('float')
  weightInGrams: number; // Calculated weight for the batch

  @Field(() => Int)
  @Column('int')
  orderIndex: number; // Order of addition

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string; // Special notes for this ingredient in this formula

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  dilution: number; // Dilution if needed (e.g., 10% in alcohol)

  @Field({ nullable: true })
  @Column({ nullable: true })
  role: string; // 'modifier', 'booster', 'fixer', 'main', etc.

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  cost: number; // Cost for this ingredient in this formula

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { OlfactiveFamily } from './olfactive-family.entity';
import { Allergen } from './allergen.entity';
import { FormulaIngredient } from './formula-ingredient.entity';

export enum VolatilityLevel {
  TOP = 'top',          // Tête - 1-2h
  TOP_HEART = 'top_heart', // Tête-Cœur
  HEART = 'heart',      // Cœur - 2-4h
  HEART_BASE = 'heart_base', // Cœur-Fond
  BASE = 'base',        // Fond - 4h+
}

export enum IngredientOrigin {
  NATURAL = 'natural',
  SYNTHETIC = 'synthetic',
  NATURAL_IDENTICAL = 'natural_identical',
  ABSOLUTE = 'absolute',
  CO2_EXTRACT = 'co2_extract',
  ESSENTIAL_OIL = 'essential_oil',
  RESINOID = 'resinoid',
  TINCTURE = 'tincture',
}

@ObjectType()
@Entity('ingredients')
export class Ingredient {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  iupacName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  casNumber: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({
    type: 'varchar',
    enum: VolatilityLevel,
    default: VolatilityLevel.HEART,
  })
  volatility: VolatilityLevel;

  @Field(() => Int)
  @Column('int')
  volatilityIndex: number; // 1-100 (1=most volatile/top, 100=least volatile/base)

  @Field()
  @Column({
    type: 'varchar',
    enum: IngredientOrigin,
  })
  origin: IngredientOrigin;

  @Field(() => Float)
  @Column('float')
  strength: number; // Puissance olfactive 1-10

  @Field(() => Float)
  @Column('float')
  diffusion: number; // Diffusion 1-10

  @Field(() => Float)
  @Column('float')
  tenacity: number; // Ténacité 1-10

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  recommendedDosageMin: number; // % minimum recommandé

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  recommendedDosageMax: number; // % maximum recommandé

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory1: number; // Lip products

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory2: number; // Deodorant/Antiperspirant

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory3: number; // Eyes

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory4: number; // Hydroalcoholic products (EdP, EdT, EdC)

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory5: number; // Body lotions, creams

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory6: number; // Air care products

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory7: number; // Rinse-off products

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory8: number; // Candles

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory9: number; // Soaps

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory10: number; // Household cleaners

  @Field(() => Float)
  @Column('float')
  ifraMaxCategory11: number; // Industrial products

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  pricePerKg: number; // Prix en EUR/kg

  @Field({ nullable: true })
  @Column({ nullable: true })
  supplier: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  countryOfOrigin: string;

  @Field()
  @Column({ default: false })
  isNatural: boolean;

  @Field()
  @Column({ default: false })
  isCOSMOSApproved: boolean;

  @Field()
  @Column({ default: false })
  isVegan: boolean;

  @Field()
  @Column({ default: false })
  isHalal: boolean;

  @Field()
  @Column({ default: false })
  isEcoResponsible: boolean;

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  odorProfile: string[]; // ['floral', 'sweet', 'powdery', etc.]

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  synergiesWith: string[]; // IDs or names of ingredients that work well together

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  conflictsWith: string[]; // IDs or names of ingredients that conflict

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  alternatives: string[]; // Alternative ingredients

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  chemicalFormula: string;

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  molecularWeight: number;

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  boilingPoint: number;

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  solubilityInAlcohol: number; // Solubility percentage in ethanol

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  solubilityInWater: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  storageConditions: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  safetyNotes: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  culturalSignificance: string[]; // Cultural/regional significance

  @Field()
  @ManyToOne(() => OlfactiveFamily, family => family.ingredients, { nullable: false })
  olfactiveFamily: OlfactiveFamily;

  @Field(() => [Allergen], { nullable: true })
  @ManyToMany(() => Allergen, allergen => allergen.ingredients)
  @JoinTable()
  allergens: Allergen[];

  @OneToMany(() => FormulaIngredient, formulaIngredient => formulaIngredient.ingredient)
  formulaIngredients: FormulaIngredient[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

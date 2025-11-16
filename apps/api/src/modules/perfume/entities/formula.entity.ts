import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { FormulaIngredient } from './formula-ingredient.entity';

export enum FormulaType {
  EAU_DE_PARFUM = 'edp',
  EAU_DE_TOILETTE = 'edt',
  EAU_DE_COLOGNE = 'edc',
  PARFUM_EXTRAIT = 'extrait',
  CANDLE = 'candle',
  AIR_CARE = 'air_care',
  BODY_CARE = 'body_care',
  CUSTOM = 'custom',
}

export enum FormulaStructureType {
  TRADITIONAL_PYRAMID = 'traditional_pyramid',
  FIBONACCI = 'fibonacci',
  GOLDEN_RATIO = 'golden_ratio',
  FRACTAL = 'fractal',
  LINEAR = 'linear',
  RADIAL = 'radial',
}

export enum FormulaMood {
  SERENITY = 'serenity',
  ENERGY = 'energy',
  SENSUALITY = 'sensuality',
  ELEGANCE = 'elegance',
  MYSTERY = 'mystery',
  JOY = 'joy',
  CONFIDENCE = 'confidence',
  NOSTALGIA = 'nostalgia',
  ADVENTURE = 'adventure',
  CALM = 'calm',
}

@ObjectType()
@Entity('formulas')
export class Formula {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({
    type: 'varchar',
    enum: FormulaType,
  })
  type: FormulaType;

  @Field()
  @Column({
    type: 'varchar',
    enum: FormulaStructureType,
    default: FormulaStructureType.TRADITIONAL_PYRAMID,
  })
  structureType: FormulaStructureType;

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  moods: FormulaMood[];

  @Field(() => Float)
  @Column('float')
  totalConcentration: number; // Concentration totale du parfum (15-20% EdP, 5-15% EdT, etc.)

  @Field(() => Float)
  @Column('float')
  topNotesPercentage: number; // % notes de tête

  @Field(() => Float)
  @Column('float')
  heartNotesPercentage: number; // % notes de cœur

  @Field(() => Float)
  @Column('float')
  baseNotesPercentage: number; // % notes de fond

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  alcoholPercentage: number; // % alcohol (usually ethanol 96%)

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  waterPercentage: number;

  @Field(() => Int, { nullable: true })
  @Column('int', { nullable: true })
  batchSize: number; // Taille du batch en ml ou g

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  estimatedCost: number; // Coût estimé

  @Field({ nullable: true })
  @Column({ nullable: true })
  currency: string;

  @Field(() => Int, { nullable: true })
  @Column('int', { nullable: true })
  macerationDays: number; // Durée de macération recommandée

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  preparationNotes: string;

  @Field()
  @Column({ default: false })
  isTemplate: boolean;

  @Field()
  @Column({ default: false })
  isPublic: boolean;

  @Field()
  @Column({ default: false })
  isNatural: boolean;

  @Field()
  @Column({ default: false })
  isCOSMOSCompliant: boolean;

  @Field()
  @Column({ default: false })
  isIFRACompliant: boolean;

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  tags: string[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  region: string; // 'senegal', 'africa', 'asia', etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  style: string; // 'floral', 'woody', 'oriental', 'fresh', 'gourmand', etc.

  @Field(() => Int, { nullable: true })
  @Column('int', { default: 0 })
  complexityScore: number; // Complexity score 1-100

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  fibonacciRatio: number; // Ratio Fibonacci utilisé si applicable

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  goldenRatio: number; // Ratio d'or utilisé si applicable

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  olfactiveFamilies: string[]; // Dominant olfactive families

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  olfactiveSignature: string; // Unique olfactive DNA

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  seasons: string[]; // 'spring', 'summer', 'autumn', 'winter'

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  occasions: string[]; // 'day', 'night', 'formal', 'casual', etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  targetGender: string; // 'masculine', 'feminine', 'unisex'

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  allergenWarnings: string[];

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  safetyNotes: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  createdBy: string; // User ID

  @Field(() => Int, { nullable: true })
  @Column('int', { default: 0 })
  usageCount: number;

  @Field(() => Int, { nullable: true })
  @Column('int', { default: 0 })
  rating: number; // 1-5 stars

  @OneToMany(() => FormulaIngredient, formulaIngredient => formulaIngredient.formula, { cascade: true })
  ingredients: FormulaIngredient[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

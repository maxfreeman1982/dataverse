import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';

export enum AnalysisPhase {
  PRE_MATCH = 'pre-match',
  LIVE = 'live',
  POST_MATCH = 'post-match',
  TRAINING = 'training',
}

export enum AnalysisFocus {
  TACTICAL = 'tactical',
  PHYSICAL = 'physical',
  TECHNICAL = 'technical',
  MENTAL = 'mental',
  FULL = 'full',
}

@InputType()
export class AnalyzeMatchInput {
  @Field()
  @IsUUID()
  matchId: string;

  @Field(() => String)
  @IsEnum(AnalysisPhase)
  phase: AnalysisPhase;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(AnalysisFocus)
  focus?: AnalysisFocus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specificInstructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  includeTrainingRecommendations?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  includeCrossSportInnovation?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  includeSetPieceAnalysis?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  generateFullReport?: boolean;
}

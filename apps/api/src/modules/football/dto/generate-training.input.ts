import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsUUID, IsInt, IsArray } from 'class-validator';

@InputType()
export class GenerateTrainingInput {
  @Field()
  @IsUUID()
  teamId: string;

  @Field()
  @IsString()
  focus: string; // tactical, technical, physical, set-pieces, recovery

  @Field(() => Int)
  @IsInt()
  duration: number; // minutes

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  targetWeaknesses?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  basedOnMatchId?: string; // generate training based on match analysis

  @Field({ nullable: true })
  @IsOptional()
  includeCrossSportDrills?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specificObjectives?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  targetPlayerIds?: string[];
}

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SpvService } from '../services/spv.service';
import { OjAuthGuard } from '../guards/oj-auth.guard';
import { CurrentInvestor } from '../decorators/current-investor.decorator';

@Resolver('SPV')
@UseGuards(OjAuthGuard)
export class SpvResolver {
  constructor(private readonly spvService: SpvService) {}

  @Query()
  async spvDashboard(
    @Args('projectId') projectId: string,
    @CurrentInvestor() investor: any,
  ) {
    // TODO: Verify investor has SPV manager role for this project
    return this.spvService.getSpvDashboard(projectId);
  }

  @Query()
  async spvProjectInvestors(
    @Args('projectId') projectId: string,
    @Args('page') page: number = 1,
    @Args('limit') limit: number = 20,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.getProjectInvestors(projectId, page, limit);
  }

  @Query()
  async spvProjectMilestones(
    @Args('projectId') projectId: string,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.getProjectMilestones(projectId);
  }

  @Query()
  async spvDocuments(
    @Args('projectId') projectId: string,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.getDocuments(projectId);
  }

  @Query()
  async spvFinancialReport(
    @Args('projectId') projectId: string,
    @Args('period') period: string,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.getFinancialReport(projectId, period);
  }

  @Query()
  async spvEscrowRequests(
    @Args('projectId') projectId: string,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.getEscrowRequests(projectId);
  }

  @Query()
  async spvDistributionList(
    @Args('projectId') projectId: string,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.getDistributionList(projectId);
  }

  @Mutation()
  async spvUpdateMilestone(
    @Args('projectId') projectId: string,
    @Args('milestoneId') milestoneId: string,
    @Args('status') status: string,
    @Args('progress') progress: number,
    @Args('notes') notes: string,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.updateMilestone(
      projectId,
      milestoneId,
      status,
      progress,
      notes,
    );
  }

  @Mutation()
  async spvAddDocument(
    @Args('projectId') projectId: string,
    @Args('documentType') documentType: string,
    @Args('title') title: string,
    @Args('fileUrl') fileUrl: string,
    @Args('description') description: string,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.addDocument(
      projectId,
      documentType,
      title,
      fileUrl,
      description,
    );
  }

  @Mutation()
  async spvRequestEscrowRelease(
    @Args('projectId') projectId: string,
    @Args('amount') amount: number,
    @Args('reason') reason: string,
    @Args('beneficiary') beneficiary: string,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.requestEscrowRelease(
      projectId,
      amount,
      reason,
      beneficiary,
    );
  }

  @Mutation()
  async spvUpdateProjectStatus(
    @Args('projectId') projectId: string,
    @Args('status') status: string,
    @Args('notes') notes: string,
    @CurrentInvestor() investor: any,
  ) {
    return this.spvService.updateProjectStatus(projectId, status, notes);
  }
}

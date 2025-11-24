import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Project } from '../entities/project.entity';
import { ProjectService } from '../services/project.service';
import { CreateProjectInput, UpdateProjectInput, ProjectFilterInput, ProjectStats } from '../dto/project.dto';
import { OjAuthGuard } from '../guards/oj-auth.guard';
import { OjAdminGuard } from '../guards/oj-admin.guard';
import { GraphQLJSON } from 'graphql-type-json';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => [Project])
  async ojProjects(
    @Args('filter', { nullable: true }) filter?: ProjectFilterInput,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<Project[]> {
    return this.projectService.getProjects(filter, search);
  }

  @Query(() => [Project])
  async activeOjProjects(): Promise<Project[]> {
    return this.projectService.getActiveProjects();
  }

  @Query(() => Project)
  async ojProject(@Args('id', { type: () => ID }) id: string): Promise<Project> {
    return this.projectService.getProjectById(id);
  }

  @Query(() => ProjectStats)
  async ojProjectStats(): Promise<ProjectStats> {
    return this.projectService.getProjectStats();
  }

  @Mutation(() => Project)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async createOjProject(@Args('input') input: CreateProjectInput): Promise<Project> {
    return this.projectService.createProject(input);
  }

  @Mutation(() => Project)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async updateOjProject(@Args('input') input: UpdateProjectInput): Promise<Project> {
    return this.projectService.updateProject(input);
  }

  @Mutation(() => Project)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async submitProjectForApproval(@Args('id', { type: () => ID }) id: string): Promise<Project> {
    return this.projectService.submitForApproval(id);
  }

  @Mutation(() => Project)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async activateOjProject(@Args('id', { type: () => ID }) id: string): Promise<Project> {
    return this.projectService.activateProject(id);
  }

  @Mutation(() => Project)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async completeOjProject(@Args('id', { type: () => ID }) id: string): Promise<Project> {
    return this.projectService.completeProject(id);
  }

  @Mutation(() => Project)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async cancelOjProject(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<Project> {
    return this.projectService.cancelProject(id, reason);
  }

  @Mutation(() => Project)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async addProjectMilestone(
    @Args('id', { type: () => ID }) id: string,
    @Args('milestone', { type: () => GraphQLJSON }) milestone: Record<string, any>,
  ): Promise<Project> {
    return this.projectService.addMilestone(id, milestone);
  }
}

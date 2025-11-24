import { Resolver, Query, Args } from '@nestjs/graphql';
import { PublicService } from '../services/public.service';

@Resolver('Public')
export class PublicResolver {
  constructor(private readonly publicService: PublicService) {}

  @Query()
  async publicPlatformStats() {
    return this.publicService.getPlatformStats();
  }

  @Query()
  async publicProjects(
    @Args('status') status?: string,
    @Args('category') category?: string,
    @Args('page') page: number = 1,
    @Args('limit') limit: number = 12,
  ) {
    return this.publicService.getPublicProjects(status, category, page, limit);
  }

  @Query()
  async publicProjectDetails(@Args('projectId') projectId: string) {
    return this.publicService.getPublicProjectDetails(projectId);
  }

  @Query()
  async publicRecentActivity(@Args('limit') limit: number = 10) {
    return this.publicService.getRecentActivity(limit);
  }

  @Query()
  async publicPerformanceMetrics() {
    return this.publicService.getPerformanceMetrics();
  }

  @Query()
  async publicCategoryStats() {
    return this.publicService.getCategoryStats();
  }
}

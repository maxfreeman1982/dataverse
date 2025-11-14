import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { MarketplaceService } from './marketplace.service';
import { Plugin } from './entities/plugin.entity';
import { PluginInstallation } from './entities/plugin-installation.entity';
import { PluginReview } from './entities/plugin-review.entity';
import {
  CreatePluginInput,
  UpdatePluginInput,
  InstallPluginInput,
  CreateReviewInput,
  GetPluginsInput,
} from './dto/marketplace.dto';

@Resolver(() => Plugin)
@UseGuards(GqlAuthGuard)
export class MarketplaceResolver {
  constructor(private marketplaceService: MarketplaceService) {}

  // ========== PLUGINS ==========

  @Mutation(() => Plugin)
  async createPlugin(
    @Args('input') input: CreatePluginInput,
    @CurrentUser() user: User,
  ): Promise<Plugin> {
    return this.marketplaceService.createPlugin(input, user.id);
  }

  @Query(() => Plugin)
  async plugin(@Args('id', { type: () => ID }) id: string): Promise<Plugin> {
    return this.marketplaceService.getPluginById(id);
  }

  @Query(() => [Plugin])
  async plugins(@Args('input', { nullable: true }) input?: GetPluginsInput): Promise<Plugin[]> {
    return this.marketplaceService.getPlugins(input || {});
  }

  @Mutation(() => Plugin)
  async updatePlugin(
    @Args('input') input: UpdatePluginInput,
    @CurrentUser() user: User,
  ): Promise<Plugin> {
    return this.marketplaceService.updatePlugin(input, user.id);
  }

  @Mutation(() => Boolean)
  async deletePlugin(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.marketplaceService.deletePlugin(id, user.id);
  }

  // ========== INSTALLATIONS ==========

  @Mutation(() => PluginInstallation)
  async installPlugin(
    @Args('input') input: InstallPluginInput,
    @CurrentUser() user: User,
  ): Promise<PluginInstallation> {
    return this.marketplaceService.installPlugin(input, user.id);
  }

  @Mutation(() => Boolean)
  async uninstallPlugin(
    @Args('pluginId', { type: () => ID }) pluginId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.marketplaceService.uninstallPlugin(pluginId, user.id);
  }

  @Query(() => [PluginInstallation])
  async installedPlugins(@CurrentUser() user: User): Promise<PluginInstallation[]> {
    return this.marketplaceService.getInstalledPlugins(user.id);
  }

  @Mutation(() => PluginInstallation)
  async togglePlugin(
    @Args('pluginId', { type: () => ID }) pluginId: string,
    @CurrentUser() user: User,
  ): Promise<PluginInstallation> {
    return this.marketplaceService.togglePlugin(pluginId, user.id);
  }

  // ========== REVIEWS ==========

  @Mutation(() => PluginReview)
  async createReview(
    @Args('input') input: CreateReviewInput,
    @CurrentUser() user: User,
  ): Promise<PluginReview> {
    return this.marketplaceService.createReview(input, user.id);
  }

  @Query(() => [PluginReview])
  async pluginReviews(
    @Args('pluginId', { type: () => ID }) pluginId: string,
  ): Promise<PluginReview[]> {
    return this.marketplaceService.getReviews(pluginId);
  }

  // ========== SEED ==========

  @Mutation(() => Boolean)
  async seedMarketplace(): Promise<boolean> {
    await this.marketplaceService.seedMarketplace();
    return true;
  }
}

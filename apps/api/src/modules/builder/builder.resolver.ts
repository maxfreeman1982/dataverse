import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BuilderService } from './builder.service';
import { Page } from './entities/page.entity';
import { PageComponent } from './entities/page-component.entity';
import { CreatePageInput, UpdatePageInput } from './dto/create-page.dto';
import {
  CreateComponentInput,
  UpdateComponentInput,
} from './dto/create-component.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Resolver(() => Page)
export class BuilderResolver {
  constructor(private readonly builderService: BuilderService) {}

  // ========== PAGE QUERIES ==========

  @Query(() => [Page], { name: 'pages' })
  @UseGuards(JwtAuthGuard)
  async getPages(@CurrentUser() user: User): Promise<Page[]> {
    return this.builderService.findAllPages(user.id);
  }

  @Query(() => Page, { name: 'page' })
  @UseGuards(JwtAuthGuard)
  async getPage(@Args('id', { type: () => ID }) id: string): Promise<Page> {
    return this.builderService.findPageById(id);
  }

  @Query(() => Page, { name: 'pageBySlug' })
  async getPageBySlug(@Args('slug') slug: string): Promise<Page> {
    return this.builderService.findPageBySlug(slug);
  }

  // ========== PAGE MUTATIONS ==========

  @Mutation(() => Page)
  @UseGuards(JwtAuthGuard)
  async createPage(
    @Args('input') input: CreatePageInput,
    @CurrentUser() user: User,
  ): Promise<Page> {
    return this.builderService.createPage(input, user.id);
  }

  @Mutation(() => Page)
  @UseGuards(JwtAuthGuard)
  async updatePage(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePageInput,
    @CurrentUser() user: User,
  ): Promise<Page> {
    return this.builderService.updatePage(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deletePage(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.builderService.deletePage(id, user.id);
  }

  @Mutation(() => Page)
  @UseGuards(JwtAuthGuard)
  async publishPage(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Page> {
    return this.builderService.publishPage(id, user.id);
  }

  @Mutation(() => Page)
  @UseGuards(JwtAuthGuard)
  async unpublishPage(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Page> {
    return this.builderService.unpublishPage(id, user.id);
  }

  // ========== COMPONENT QUERIES ==========

  @Query(() => [PageComponent], { name: 'pageComponents' })
  @UseGuards(JwtAuthGuard)
  async getPageComponents(
    @Args('pageId', { type: () => ID }) pageId: string,
  ): Promise<PageComponent[]> {
    return this.builderService.findComponentsByPageId(pageId);
  }

  @Query(() => PageComponent, { name: 'component' })
  @UseGuards(JwtAuthGuard)
  async getComponent(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PageComponent> {
    return this.builderService.findComponentById(id);
  }

  // ========== COMPONENT MUTATIONS ==========

  @Mutation(() => PageComponent)
  @UseGuards(JwtAuthGuard)
  async createComponent(
    @Args('input') input: CreateComponentInput,
  ): Promise<PageComponent> {
    return this.builderService.createComponent(input);
  }

  @Mutation(() => PageComponent)
  @UseGuards(JwtAuthGuard)
  async updateComponent(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateComponentInput,
  ): Promise<PageComponent> {
    return this.builderService.updateComponent(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteComponent(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.builderService.deleteComponent(id);
  }

  @Mutation(() => [PageComponent])
  @UseGuards(JwtAuthGuard)
  async reorderComponents(
    @Args('pageId', { type: () => ID }) pageId: string,
    @Args('componentIds', { type: () => [ID] }) componentIds: string[],
  ): Promise<PageComponent[]> {
    return this.builderService.reorderComponents(pageId, componentIds);
  }
}

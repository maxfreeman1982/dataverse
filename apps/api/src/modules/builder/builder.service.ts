import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page, PageStatus } from './entities/page.entity';
import { PageComponent } from './entities/page-component.entity';
import { CreatePageInput, UpdatePageInput } from './dto/create-page.dto';
import {
  CreateComponentInput,
  UpdateComponentInput,
} from './dto/create-component.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class BuilderService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(PageComponent)
    private readonly componentRepository: Repository<PageComponent>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  // ========== PAGE OPERATIONS ==========

  async createPage(
    input: CreatePageInput,
    userId: string,
  ): Promise<Page> {
    // Check if slug already exists
    const existing = await this.pageRepository.findOne({
      where: { slug: input.slug },
    });

    if (existing) {
      throw new ConflictException(`Page with slug "${input.slug}" already exists`);
    }

    const page = this.pageRepository.create({
      ...input,
      createdById: userId,
      status: PageStatus.DRAFT,
    });

    const savedPage = await this.pageRepository.save(page);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('page:created', { page: savedPage });

    return savedPage;
  }

  async findAllPages(userId?: string): Promise<Page[]> {
    const query = this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.createdBy', 'createdBy')
      .leftJoinAndSelect('page.components', 'components')
      .orderBy('page.updatedAt', 'DESC');

    if (userId) {
      query.where('page.createdById = :userId', { userId });
    }

    return query.getMany();
  }

  async findPageById(id: string): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id },
      relations: ['createdBy', 'components'],
    });

    if (!page) {
      throw new NotFoundException(`Page with ID "${id}" not found`);
    }

    return page;
  }

  async findPageBySlug(slug: string): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { slug },
      relations: ['createdBy', 'components'],
    });

    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }

    return page;
  }

  async updatePage(
    id: string,
    input: UpdatePageInput,
    userId: string,
  ): Promise<Page> {
    const page = await this.findPageById(id);

    // Check ownership
    if (page.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to update this page');
    }

    // Check slug uniqueness if changed
    if (input.slug && input.slug !== page.slug) {
      const existing = await this.pageRepository.findOne({
        where: { slug: input.slug },
      });
      if (existing) {
        throw new ConflictException(`Page with slug "${input.slug}" already exists`);
      }
    }

    Object.assign(page, input);

    // Set published date when publishing
    if (input.status === PageStatus.PUBLISHED && !page.publishedAt) {
      page.publishedAt = new Date();
    }

    const savedPage = await this.pageRepository.save(page);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('page:updated', { page: savedPage });

    return savedPage;
  }

  async deletePage(id: string, userId: string): Promise<boolean> {
    const page = await this.findPageById(id);

    // Check ownership
    if (page.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to delete this page');
    }

    await this.pageRepository.remove(page);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('page:deleted', { pageId: id });

    return true;
  }

  async publishPage(id: string, userId: string): Promise<Page> {
    return this.updatePage(
      id,
      { status: PageStatus.PUBLISHED },
      userId,
    );
  }

  async unpublishPage(id: string, userId: string): Promise<Page> {
    return this.updatePage(
      id,
      { status: PageStatus.DRAFT },
      userId,
    );
  }

  // ========== COMPONENT OPERATIONS ==========

  async createComponent(input: CreateComponentInput): Promise<PageComponent> {
    // Verify page exists
    await this.findPageById(input.pageId);

    const component = this.componentRepository.create(input);
    const savedComponent = await this.componentRepository.save(component);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('component:created', {
      component: savedComponent,
      pageId: input.pageId,
    });

    return savedComponent;
  }

  async findComponentsByPageId(pageId: string): Promise<PageComponent[]> {
    return this.componentRepository.find({
      where: { pageId },
      order: { order: 'ASC' },
    });
  }

  async findComponentById(id: string): Promise<PageComponent> {
    const component = await this.componentRepository.findOne({
      where: { id },
    });

    if (!component) {
      throw new NotFoundException(`Component with ID "${id}" not found`);
    }

    return component;
  }

  async updateComponent(
    id: string,
    input: UpdateComponentInput,
  ): Promise<PageComponent> {
    const component = await this.findComponentById(id);

    Object.assign(component, input);

    const savedComponent = await this.componentRepository.save(component);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('component:updated', {
      component: savedComponent,
      pageId: component.pageId,
    });

    return savedComponent;
  }

  async deleteComponent(id: string): Promise<boolean> {
    const component = await this.findComponentById(id);
    const pageId = component.pageId;

    await this.componentRepository.remove(component);

    // Emit WebSocket event
    this.websocketGateway.emitToAll('component:deleted', {
      componentId: id,
      pageId,
    });

    return true;
  }

  async reorderComponents(
    pageId: string,
    componentIds: string[],
  ): Promise<PageComponent[]> {
    // Verify page exists
    await this.findPageById(pageId);

    const components = await Promise.all(
      componentIds.map(async (id, index) => {
        const component = await this.findComponentById(id);
        component.order = index;
        return this.componentRepository.save(component);
      }),
    );

    // Emit WebSocket event
    this.websocketGateway.emitToAll('components:reordered', {
      pageId,
      components,
    });

    return components;
  }
}

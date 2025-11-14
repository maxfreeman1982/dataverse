import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin, PluginStatus } from './entities/plugin.entity';
import { PluginInstallation, InstallationStatus } from './entities/plugin-installation.entity';
import { PluginReview } from './entities/plugin-review.entity';
import {
  CreatePluginInput,
  UpdatePluginInput,
  InstallPluginInput,
  CreateReviewInput,
  GetPluginsInput,
} from './dto/marketplace.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Plugin)
    private pluginRepository: Repository<Plugin>,
    @InjectRepository(PluginInstallation)
    private installationRepository: Repository<PluginInstallation>,
    @InjectRepository(PluginReview)
    private reviewRepository: Repository<PluginReview>,
    private websocketGateway: WebsocketGateway,
  ) {}

  // ========== PLUGINS ==========

  async createPlugin(input: CreatePluginInput, userId: string): Promise<Plugin> {
    // Check if slug is unique
    const existing = await this.pluginRepository.findOne({
      where: { slug: input.slug },
    });

    if (existing) {
      throw new BadRequestException('Plugin slug already exists');
    }

    const plugin = this.pluginRepository.create({
      ...input,
      authorId: userId,
      status: PluginStatus.DRAFT,
      averageRating: 0,
      reviewCount: 0,
      downloadCount: 0,
      installCount: 0,
    });

    const saved = await this.pluginRepository.save(plugin);

    return this.getPluginById(saved.id);
  }

  async getPluginById(id: string): Promise<Plugin> {
    const plugin = await this.pluginRepository.findOne({
      where: { id },
      relations: ['authorUser', 'reviews', 'reviews.user'],
    });

    if (!plugin) {
      throw new NotFoundException('Plugin not found');
    }

    return plugin;
  }

  async getPlugins(input: GetPluginsInput): Promise<Plugin[]> {
    const query = this.pluginRepository
      .createQueryBuilder('plugin')
      .leftJoinAndSelect('plugin.authorUser', 'author')
      .leftJoinAndSelect('plugin.reviews', 'reviews');

    if (input.category) {
      query.andWhere('plugin.category = :category', { category: input.category });
    }

    if (input.status) {
      query.andWhere('plugin.status = :status', { status: input.status });
    } else {
      // Default to published only
      query.andWhere('plugin.status = :status', { status: PluginStatus.PUBLISHED });
    }

    if (input.featured !== undefined) {
      query.andWhere('plugin.isFeatured = :featured', { featured: input.featured });
    }

    if (input.verified !== undefined) {
      query.andWhere('plugin.isVerified = :verified', { verified: input.verified });
    }

    if (input.search) {
      query.andWhere(
        '(plugin.name ILIKE :search OR plugin.description ILIKE :search OR plugin.tags::text ILIKE :search)',
        { search: `%${input.search}%` },
      );
    }

    query.orderBy('plugin.isFeatured', 'DESC');
    query.addOrderBy('plugin.downloadCount', 'DESC');
    query.addOrderBy('plugin.createdAt', 'DESC');

    if (input.limit) {
      query.take(input.limit);
    } else {
      query.take(50);
    }

    if (input.offset) {
      query.skip(input.offset);
    }

    return query.getMany();
  }

  async updatePlugin(input: UpdatePluginInput, userId: string): Promise<Plugin> {
    const plugin = await this.pluginRepository.findOne({
      where: { id: input.id, authorId: userId },
    });

    if (!plugin) {
      throw new NotFoundException('Plugin not found or you do not have permission');
    }

    Object.assign(plugin, input);

    if (input.status === PluginStatus.PUBLISHED && !plugin.publishedAt) {
      plugin.publishedAt = new Date();
    }

    await this.pluginRepository.save(plugin);

    return this.getPluginById(plugin.id);
  }

  async deletePlugin(id: string, userId: string): Promise<boolean> {
    const plugin = await this.pluginRepository.findOne({
      where: { id, authorId: userId },
    });

    if (!plugin) {
      throw new NotFoundException('Plugin not found or you do not have permission');
    }

    await this.pluginRepository.remove(plugin);

    return true;
  }

  // ========== INSTALLATIONS ==========

  async installPlugin(input: InstallPluginInput, userId: string): Promise<PluginInstallation> {
    const plugin = await this.getPluginById(input.pluginId);

    if (plugin.status !== PluginStatus.PUBLISHED) {
      throw new BadRequestException('Plugin is not published');
    }

    // Check if already installed
    const existing = await this.installationRepository.findOne({
      where: {
        pluginId: input.pluginId,
        userId,
        status: InstallationStatus.INSTALLED,
      },
    });

    if (existing) {
      throw new BadRequestException('Plugin already installed');
    }

    const installation = this.installationRepository.create({
      pluginId: input.pluginId,
      userId,
      installedVersion: plugin.version,
      status: InstallationStatus.INSTALLED,
      isEnabled: true,
    });

    const saved = await this.installationRepository.save(installation);

    // Update plugin stats
    plugin.installCount += 1;
    plugin.downloadCount += 1;
    await this.pluginRepository.save(plugin);

    const full = await this.installationRepository.findOne({
      where: { id: saved.id },
      relations: ['plugin', 'user'],
    });

    this.websocketGateway.emitToUser(userId, 'plugin:installed', {
      installation: full,
    });

    return full!;
  }

  async uninstallPlugin(pluginId: string, userId: string): Promise<boolean> {
    const installation = await this.installationRepository.findOne({
      where: {
        pluginId,
        userId,
        status: InstallationStatus.INSTALLED,
      },
    });

    if (!installation) {
      throw new NotFoundException('Plugin installation not found');
    }

    installation.status = InstallationStatus.UNINSTALLED;
    await this.installationRepository.save(installation);

    // Update plugin stats
    const plugin = await this.pluginRepository.findOne({ where: { id: pluginId } });
    if (plugin) {
      plugin.installCount = Math.max(0, plugin.installCount - 1);
      await this.pluginRepository.save(plugin);
    }

    this.websocketGateway.emitToUser(userId, 'plugin:uninstalled', {
      pluginId,
    });

    return true;
  }

  async getInstalledPlugins(userId: string): Promise<PluginInstallation[]> {
    return this.installationRepository.find({
      where: {
        userId,
        status: InstallationStatus.INSTALLED,
      },
      relations: ['plugin', 'plugin.authorUser'],
      order: { installedAt: 'DESC' },
    });
  }

  async togglePlugin(pluginId: string, userId: string): Promise<PluginInstallation> {
    const installation = await this.installationRepository.findOne({
      where: {
        pluginId,
        userId,
        status: InstallationStatus.INSTALLED,
      },
      relations: ['plugin'],
    });

    if (!installation) {
      throw new NotFoundException('Plugin installation not found');
    }

    installation.isEnabled = !installation.isEnabled;
    await this.installationRepository.save(installation);

    return installation;
  }

  // ========== REVIEWS ==========

  async createReview(input: CreateReviewInput, userId: string): Promise<PluginReview> {
    if (input.rating < 1 || input.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if plugin exists
    await this.getPluginById(input.pluginId);

    // Check if user already reviewed
    const existing = await this.reviewRepository.findOne({
      where: {
        pluginId: input.pluginId,
        userId,
      },
    });

    if (existing) {
      // Update existing review
      existing.rating = input.rating;
      existing.comment = input.comment;
      await this.reviewRepository.save(existing);
      await this.updatePluginRating(input.pluginId);
      return existing;
    }

    const review = this.reviewRepository.create({
      ...input,
      userId,
    });

    const saved = await this.reviewRepository.save(review);

    // Update plugin rating
    await this.updatePluginRating(input.pluginId);

    const full = await this.reviewRepository.findOne({
      where: { id: saved.id },
      relations: ['plugin', 'user'],
    });

    return full!;
  }

  async getReviews(pluginId: string): Promise<PluginReview[]> {
    return this.reviewRepository.find({
      where: { pluginId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  private async updatePluginRating(pluginId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { pluginId },
    });

    const plugin = await this.pluginRepository.findOne({
      where: { id: pluginId },
    });

    if (!plugin) return;

    if (reviews.length === 0) {
      plugin.averageRating = 0;
      plugin.reviewCount = 0;
    } else {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      plugin.averageRating = sum / reviews.length;
      plugin.reviewCount = reviews.length;
    }

    await this.pluginRepository.save(plugin);
  }

  // ========== SEED DATA ==========

  async seedMarketplace(): Promise<void> {
    const count = await this.pluginRepository.count();
    if (count > 0) return; // Already seeded

    // Get a user for authorship
    const users = await this.pluginRepository.manager
      .getRepository('users')
      .find({ take: 1 });

    if (users.length === 0) return;

    const userId = users[0].id;

    const samplePlugins = [
      {
        name: 'Advanced Analytics Dashboard',
        slug: 'advanced-analytics',
        description: 'Comprehensive analytics and reporting dashboard with custom visualizations',
        longDescription: 'Transform your data into actionable insights with advanced charts, graphs, and real-time analytics.',
        version: '1.0.0',
        author: 'DataVerse Team',
        authorId: userId,
        category: 'analytics',
        status: PluginStatus.PUBLISHED,
        downloadUrl: 'https://example.com/plugins/analytics.zip',
        tags: ['analytics', 'dashboard', 'charts'],
        isFeatured: true,
        isVerified: true,
        downloadCount: 1250,
        installCount: 890,
        averageRating: 4.8,
        reviewCount: 45,
        publishedAt: new Date(),
      },
      {
        name: 'Slack Integration',
        slug: 'slack-integration',
        description: 'Connect your workspace with Slack for seamless team communication',
        longDescription: 'Receive notifications, share updates, and collaborate with your team directly through Slack.',
        version: '2.1.0',
        author: 'IntegrationHub',
        authorId: userId,
        category: 'integration',
        status: PluginStatus.PUBLISHED,
        downloadUrl: 'https://example.com/plugins/slack.zip',
        tags: ['slack', 'integration', 'notifications'],
        isFeatured: true,
        isVerified: true,
        downloadCount: 2100,
        installCount: 1450,
        averageRating: 4.9,
        reviewCount: 78,
        publishedAt: new Date(),
      },
      {
        name: 'AI Content Generator',
        slug: 'ai-content-generator',
        description: 'Generate high-quality content using advanced AI models',
        longDescription: 'Leverage GPT-4 and other AI models to generate blog posts, emails, and creative content instantly.',
        version: '1.5.2',
        author: 'AI Labs',
        authorId: userId,
        category: 'ai_ml',
        status: PluginStatus.PUBLISHED,
        downloadUrl: 'https://example.com/plugins/ai-content.zip',
        tags: ['ai', 'content', 'gpt', 'writing'],
        isFeatured: false,
        isVerified: true,
        downloadCount: 3200,
        installCount: 2100,
        averageRating: 4.7,
        reviewCount: 156,
        publishedAt: new Date(),
      },
      {
        name: 'Task Automation Pro',
        slug: 'task-automation-pro',
        description: 'Automate repetitive tasks with advanced workflow templates',
        longDescription: 'Save time and increase productivity with pre-built automation templates for common workflows.',
        version: '3.0.0',
        author: 'AutomationExperts',
        authorId: userId,
        category: 'automation',
        status: PluginStatus.PUBLISHED,
        downloadUrl: 'https://example.com/plugins/automation.zip',
        tags: ['automation', 'workflow', 'productivity'],
        isFeatured: true,
        isVerified: true,
        downloadCount: 1800,
        installCount: 1200,
        averageRating: 4.6,
        reviewCount: 92,
        publishedAt: new Date(),
      },
      {
        name: 'Custom Theme Builder',
        slug: 'theme-builder',
        description: 'Design and customize your workspace appearance with ease',
        longDescription: 'Create beautiful custom themes with our intuitive theme builder. No coding required!',
        version: '1.2.1',
        author: 'DesignStudio',
        authorId: userId,
        category: 'design',
        status: PluginStatus.PUBLISHED,
        downloadUrl: 'https://example.com/plugins/themes.zip',
        tags: ['design', 'themes', 'customization'],
        isFeatured: false,
        isVerified: false,
        downloadCount: 890,
        installCount: 520,
        averageRating: 4.4,
        reviewCount: 34,
        publishedAt: new Date(),
      },
    ];

    for (const pluginData of samplePlugins) {
      const plugin = this.pluginRepository.create(pluginData as any);
      await this.pluginRepository.save(plugin);
    }
  }
}

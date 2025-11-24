import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Project, ProjectStatus, ProjectCategory } from '../entities/project.entity';
import { CreateProjectInput, UpdateProjectInput, ProjectFilterInput, ProjectStats } from '../dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async createProject(input: CreateProjectInput): Promise<Project> {
    const existingProject = await this.projectRepository.findOne({
      where: { seriesCode: input.seriesCode },
    });

    if (existingProject) {
      throw new BadRequestException('Un projet avec ce code série existe déjà');
    }

    const project = this.projectRepository.create({
      ...input,
      status: ProjectStatus.DRAFT,
      progressPercent: 0,
      totalInvestors: 0,
      raisedAmount: 0,
    });

    return this.projectRepository.save(project);
  }

  async updateProject(input: UpdateProjectInput): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({
      where: { id: input.id },
    });

    Object.assign(project, input);
    return this.projectRepository.save(project);
  }

  async getProjectById(id: string): Promise<Project> {
    return this.projectRepository.findOneOrFail({
      where: { id },
      relations: ['investments'],
    });
  }

  async getProjects(filter?: ProjectFilterInput, search?: string): Promise<Project[]> {
    const where: FindOptionsWhere<Project> = {};

    if (filter?.category) {
      where.category = filter.category;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    let queryBuilder = this.projectRepository.createQueryBuilder('project');

    if (filter?.category) {
      queryBuilder = queryBuilder.andWhere('project.category = :category', { category: filter.category });
    }

    if (filter?.status) {
      queryBuilder = queryBuilder.andWhere('project.status = :status', { status: filter.status });
    }

    if (filter?.minInvestment) {
      queryBuilder = queryBuilder.andWhere('project.minimumInvestment >= :minInvestment', {
        minInvestment: filter.minInvestment,
      });
    }

    if (filter?.maxInvestment) {
      queryBuilder = queryBuilder.andWhere('project.minimumInvestment <= :maxInvestment', {
        maxInvestment: filter.maxInvestment,
      });
    }

    if (filter?.minReturn) {
      queryBuilder = queryBuilder.andWhere('project.expectedReturn >= :minReturn', {
        minReturn: filter.minReturn,
      });
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(project.name ILIKE :search OR project.description ILIKE :search OR project.spvName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.orderBy('project.createdAt', 'DESC').getMany();
  }

  async getActiveProjects(): Promise<Project[]> {
    return this.projectRepository.find({
      where: [
        { status: ProjectStatus.ACTIVE },
        { status: ProjectStatus.IN_PROGRESS },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getProjectStats(): Promise<ProjectStats> {
    const projects = await this.projectRepository.find();

    const activeProjects = projects.filter(
      (p) => p.status === ProjectStatus.ACTIVE || p.status === ProjectStatus.IN_PROGRESS,
    );

    const totalFundsRaised = projects.reduce((sum, p) => sum + Number(p.raisedAmount), 0);
    const totalInvestors = projects.reduce((sum, p) => sum + p.totalInvestors, 0);

    const projectsWithReturn = projects.filter((p) => p.expectedReturn > 0);
    const averageReturn =
      projectsWithReturn.length > 0
        ? projectsWithReturn.reduce((sum, p) => sum + Number(p.expectedReturn), 0) / projectsWithReturn.length
        : 0;

    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      totalFundsRaised,
      averageReturn,
      totalInvestors,
    };
  }

  async activateProject(id: string): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({ where: { id } });

    if (project.status !== ProjectStatus.PENDING_APPROVAL && project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException('Ce projet ne peut pas être activé');
    }

    project.status = ProjectStatus.ACTIVE;
    return this.projectRepository.save(project);
  }

  async submitForApproval(id: string): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({ where: { id } });

    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException('Seuls les projets en brouillon peuvent être soumis');
    }

    project.status = ProjectStatus.PENDING_APPROVAL;
    return this.projectRepository.save(project);
  }

  async completeProject(id: string): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({ where: { id } });

    if (project.status !== ProjectStatus.IN_PROGRESS) {
      throw new BadRequestException('Ce projet ne peut pas être marqué comme terminé');
    }

    project.status = ProjectStatus.COMPLETED;
    project.endDate = new Date();
    return this.projectRepository.save(project);
  }

  async cancelProject(id: string, reason?: string): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({ where: { id } });

    if (project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.CANCELLED) {
      throw new BadRequestException('Ce projet ne peut pas être annulé');
    }

    project.status = ProjectStatus.CANCELLED;
    if (reason) {
      project.financialDetails = { ...project.financialDetails, cancellationReason: reason };
    }

    return this.projectRepository.save(project);
  }

  async updateProgress(id: string, raisedAmount: number, totalInvestors: number): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({ where: { id } });

    project.raisedAmount = raisedAmount;
    project.totalInvestors = totalInvestors;
    project.progressPercent = (raisedAmount / Number(project.targetAmount)) * 100;

    if (project.progressPercent >= 100 && project.status === ProjectStatus.ACTIVE) {
      project.status = ProjectStatus.FUNDED;
    }

    return this.projectRepository.save(project);
  }

  async addMilestone(id: string, milestone: Record<string, any>): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({ where: { id } });

    const milestones = project.milestones || [];
    milestones.push({
      ...milestone,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });

    project.milestones = milestones;
    return this.projectRepository.save(project);
  }
}

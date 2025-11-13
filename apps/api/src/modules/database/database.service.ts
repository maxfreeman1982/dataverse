import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseTable } from './entities/database-table.entity';
import { DatabaseColumn, ColumnType } from './entities/database-column.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(DatabaseTable)
    private readonly tableRepository: Repository<DatabaseTable>,
    @InjectRepository(DatabaseColumn)
    private readonly columnRepository: Repository<DatabaseColumn>,
  ) {}

  async createTable(data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    createdById: string;
    columns: Array<{
      name: string;
      slug: string;
      type: ColumnType;
      description?: string;
      isRequired?: boolean;
      isUnique?: boolean;
      order?: number;
      defaultValue?: string;
      options?: Record<string, any>;
    }>;
  }): Promise<DatabaseTable> {
    const table = this.tableRepository.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      createdById: data.createdById,
    });

    const savedTable = await this.tableRepository.save(table);

    // Create columns
    const columns = data.columns.map((col, index) =>
      this.columnRepository.create({
        ...col,
        order: col.order ?? index,
        tableId: savedTable.id,
      }),
    );

    await this.columnRepository.save(columns);

    return this.findOne(savedTable.id);
  }

  async findAll(): Promise<DatabaseTable[]> {
    return this.tableRepository.find({
      relations: ['columns', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DatabaseTable> {
    const table = await this.tableRepository.findOne({
      where: { id },
      relations: ['columns', 'createdBy'],
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return table;
  }

  async findBySlug(slug: string): Promise<DatabaseTable> {
    const table = await this.tableRepository.findOne({
      where: { slug },
      relations: ['columns', 'createdBy'],
    });

    if (!table) {
      throw new NotFoundException(`Table with slug ${slug} not found`);
    }

    return table;
  }

  async updateTable(
    id: string,
    data: Partial<Pick<DatabaseTable, 'name' | 'description' | 'icon'>>,
  ): Promise<DatabaseTable> {
    const table = await this.findOne(id);
    Object.assign(table, data);
    await this.tableRepository.save(table);
    return this.findOne(id);
  }

  async deleteTable(id: string): Promise<void> {
    const result = await this.tableRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
  }

  async addColumn(
    tableId: string,
    data: {
      name: string;
      slug: string;
      type: ColumnType;
      description?: string;
      isRequired?: boolean;
      isUnique?: boolean;
      order?: number;
      defaultValue?: string;
      options?: Record<string, any>;
    },
  ): Promise<DatabaseColumn> {
    const table = await this.findOne(tableId);

    const column = this.columnRepository.create({
      ...data,
      tableId: table.id,
      order: data.order ?? table.columns.length,
    });

    return this.columnRepository.save(column);
  }

  async updateColumn(
    columnId: string,
    data: Partial<Omit<DatabaseColumn, 'id' | 'tableId'>>,
  ): Promise<DatabaseColumn> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    Object.assign(column, data);
    return this.columnRepository.save(column);
  }

  async deleteColumn(columnId: string): Promise<void> {
    const result = await this.columnRepository.delete(columnId);
    if (result.affected === 0) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseRecord } from './entities/database-record.entity';
import { DatabaseTable } from './entities/database-table.entity';
import { DatabaseColumn, ColumnType } from './entities/database-column.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';

export interface RecordFilters {
  search?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface PaginatedRecords {
  records: DatabaseRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(DatabaseRecord)
    private readonly recordRepository: Repository<DatabaseRecord>,
    @InjectRepository(DatabaseTable)
    private readonly tableRepository: Repository<DatabaseTable>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async create(
    tableId: string,
    data: Record<string, any>,
    userId: string,
  ): Promise<DatabaseRecord> {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['columns'],
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    // Validate data against schema
    this.validateRecordData(data, table.columns);

    const record = this.recordRepository.create({
      tableId,
      data,
      createdById: userId,
      updatedById: userId,
    });

    const savedRecord = await this.recordRepository.save(record);

    // Emit WebSocket event
    this.websocketGateway.emitToTable(tableId, 'record:created', {
      record: savedRecord,
      tableId,
    });

    return savedRecord;
  }

  async findAll(
    tableId: string,
    filters?: RecordFilters,
  ): Promise<PaginatedRecords> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.recordRepository
      .createQueryBuilder('record')
      .where('record.table_id = :tableId', { tableId })
      .leftJoinAndSelect('record.createdBy', 'createdBy')
      .leftJoinAndSelect('record.updatedBy', 'updatedBy');

    // Apply search (search in JSONB data)
    if (filters?.search) {
      queryBuilder.andWhere(
        `record.data::text ILIKE :search`,
        { search: `%${filters.search}%` }
      );
    }

    // Apply filters
    if (filters?.filters) {
      Object.entries(filters.filters).forEach(([key, value]) => {
        queryBuilder.andWhere(
          `record.data->>'${key}' = :${key}`,
          { [key]: String(value) }
        );
      });
    }

    // Apply sorting
    if (filters?.sortBy) {
      const order = filters.sortOrder || 'ASC';
      if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
        queryBuilder.orderBy(`record.${filters.sortBy}`, order);
      } else {
        // Sort by JSONB field
        queryBuilder.orderBy(`record.data->>'${filters.sortBy}'`, order);
      }
    } else {
      queryBuilder.orderBy('record.createdAt', 'DESC');
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const records = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<DatabaseRecord> {
    const record = await this.recordRepository.findOne({
      where: { id },
      relations: ['table', 'table.columns', 'createdBy', 'updatedBy'],
    });

    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    return record;
  }

  async update(
    id: string,
    data: Record<string, any>,
    userId: string,
  ): Promise<DatabaseRecord> {
    const record = await this.findOne(id);

    // Validate data against schema
    this.validateRecordData(data, record.table.columns);

    // Merge data (partial update)
    record.data = { ...record.data, ...data };
    record.updatedById = userId;

    const updatedRecord = await this.recordRepository.save(record);

    // Emit WebSocket event
    this.websocketGateway.emitToTable(updatedRecord.table.id, 'record:updated', {
      record: updatedRecord,
      tableId: updatedRecord.table.id,
    });

    return updatedRecord;
  }

  async delete(id: string): Promise<void> {
    const record = await this.recordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    const tableId = record.tableId;
    await this.recordRepository.delete(id);

    // Emit WebSocket event
    this.websocketGateway.emitToTable(tableId, 'record:deleted', {
      recordId: id,
      tableId,
    });
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const result = await this.recordRepository.delete(ids);
    return result.affected || 0;
  }

  async countByTable(tableId: string): Promise<number> {
    return this.recordRepository.count({ where: { tableId } });
  }

  private validateRecordData(
    data: Record<string, any>,
    columns: DatabaseColumn[],
  ): void {
    const errors: string[] = [];

    // Check required fields
    columns.forEach((column) => {
      if (column.isRequired && !data[column.slug]) {
        errors.push(`Field '${column.name}' is required`);
      }

      // Validate data types
      if (data[column.slug] !== undefined && data[column.slug] !== null) {
        const value = data[column.slug];
        switch (column.type) {
          case ColumnType.NUMBER:
            if (typeof value !== 'number' && isNaN(Number(value))) {
              errors.push(`Field '${column.name}' must be a number`);
            }
            break;
          case ColumnType.BOOLEAN:
            if (typeof value !== 'boolean') {
              errors.push(`Field '${column.name}' must be a boolean`);
            }
            break;
          case ColumnType.EMAIL:
            if (!this.isValidEmail(String(value))) {
              errors.push(`Field '${column.name}' must be a valid email`);
            }
            break;
          case ColumnType.URL:
            if (!this.isValidUrl(String(value))) {
              errors.push(`Field '${column.name}' must be a valid URL`);
            }
            break;
          case ColumnType.DATE:
          case ColumnType.DATETIME:
            if (!this.isValidDate(value)) {
              errors.push(`Field '${column.name}' must be a valid date`);
            }
            break;
        }
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidDate(date: any): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }
}

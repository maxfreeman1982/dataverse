import {
  Resolver,
  Query,
  Mutation,
  Args,
  InputType,
  Field,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLJSONObject } from 'graphql-type-json';
import { RecordsService } from './records.service';
import { DatabaseRecord } from './entities/database-record.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@InputType()
class RecordFiltersInput {
  @Field({ nullable: true })
  search?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  filters?: Record<string, any>;

  @Field({ nullable: true })
  sortBy?: string;

  @Field({ nullable: true })
  sortOrder?: string;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

@ObjectType()
class PaginatedRecordsResponse {
  @Field(() => [DatabaseRecord])
  records: DatabaseRecord[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@Resolver(() => DatabaseRecord)
export class RecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Query(() => PaginatedRecordsResponse, { name: 'databaseRecords' })
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Args('tableId') tableId: string,
    @Args('filters', { type: () => RecordFiltersInput, nullable: true })
    filters?: RecordFiltersInput,
  ): Promise<PaginatedRecordsResponse> {
    return this.recordsService.findAll(tableId, {
      ...filters,
      sortOrder: filters?.sortOrder as 'ASC' | 'DESC',
    });
  }

  @Query(() => DatabaseRecord, { name: 'databaseRecord' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Args('id') id: string): Promise<DatabaseRecord> {
    return this.recordsService.findOne(id);
  }

  @Query(() => Int, { name: 'databaseRecordCount' })
  @UseGuards(JwtAuthGuard)
  async count(@Args('tableId') tableId: string): Promise<number> {
    return this.recordsService.countByTable(tableId);
  }

  @Mutation(() => DatabaseRecord)
  @UseGuards(JwtAuthGuard)
  async createDatabaseRecord(
    @Args('tableId') tableId: string,
    @Args('data', { type: () => GraphQLJSONObject }) data: Record<string, any>,
    @CurrentUser() user: User,
  ): Promise<DatabaseRecord> {
    return this.recordsService.create(tableId, data, user.id);
  }

  @Mutation(() => DatabaseRecord)
  @UseGuards(JwtAuthGuard)
  async updateDatabaseRecord(
    @Args('id') id: string,
    @Args('data', { type: () => GraphQLJSONObject }) data: Record<string, any>,
    @CurrentUser() user: User,
  ): Promise<DatabaseRecord> {
    return this.recordsService.update(id, data, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteDatabaseRecord(@Args('id') id: string): Promise<boolean> {
    await this.recordsService.delete(id);
    return true;
  }

  @Mutation(() => Int)
  @UseGuards(JwtAuthGuard)
  async bulkDeleteDatabaseRecords(
    @Args('ids', { type: () => [String] }) ids: string[],
  ): Promise<number> {
    return this.recordsService.bulkDelete(ids);
  }
}

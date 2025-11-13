import {
  Resolver,
  Query,
  Mutation,
  Args,
  InputType,
  Field,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseTable } from './entities/database-table.entity';
import { DatabaseColumn, ColumnType } from './entities/database-column.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@InputType()
class CreateColumnInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => ColumnType)
  type: ColumnType;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  isRequired?: boolean;

  @Field({ nullable: true })
  isUnique?: boolean;

  @Field({ nullable: true })
  order?: number;

  @Field({ nullable: true })
  defaultValue?: string;
}

@InputType()
class CreateTableInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => [CreateColumnInput])
  columns: CreateColumnInput[];
}

@Resolver(() => DatabaseTable)
export class DatabaseResolver {
  constructor(private readonly databaseService: DatabaseService) {}

  @Query(() => [DatabaseTable], { name: 'databaseTables' })
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<DatabaseTable[]> {
    return this.databaseService.findAll();
  }

  @Query(() => DatabaseTable, { name: 'databaseTable' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Args('id') id: string): Promise<DatabaseTable> {
    return this.databaseService.findOne(id);
  }

  @Query(() => DatabaseTable, { name: 'databaseTableBySlug' })
  @UseGuards(JwtAuthGuard)
  async findBySlug(@Args('slug') slug: string): Promise<DatabaseTable> {
    return this.databaseService.findBySlug(slug);
  }

  @Mutation(() => DatabaseTable)
  @UseGuards(JwtAuthGuard)
  async createDatabaseTable(
    @Args('input') input: CreateTableInput,
    @Args('userId') userId: string,
  ): Promise<DatabaseTable> {
    return this.databaseService.createTable({
      ...input,
      createdById: userId,
    });
  }

  @Mutation(() => DatabaseTable)
  @UseGuards(JwtAuthGuard)
  async updateDatabaseTable(
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('icon', { nullable: true }) icon?: string,
  ): Promise<DatabaseTable> {
    return this.databaseService.updateTable(id, {
      name,
      description,
      icon,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteDatabaseTable(@Args('id') id: string): Promise<boolean> {
    await this.databaseService.deleteTable(id);
    return true;
  }

  @Mutation(() => DatabaseColumn)
  @UseGuards(JwtAuthGuard)
  async addDatabaseColumn(
    @Args('tableId') tableId: string,
    @Args('input') input: CreateColumnInput,
  ): Promise<DatabaseColumn> {
    return this.databaseService.addColumn(tableId, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteDatabaseColumn(@Args('id') id: string): Promise<boolean> {
    await this.databaseService.deleteColumn(id);
    return true;
  }
}

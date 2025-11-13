import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseTable } from './entities/database-table.entity';
import { DatabaseColumn } from './entities/database-column.entity';
import { DatabaseService } from './database.service';
import { DatabaseResolver } from './database.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseTable, DatabaseColumn])],
  providers: [DatabaseService, DatabaseResolver],
  exports: [DatabaseService],
})
export class DatabaseModule {}

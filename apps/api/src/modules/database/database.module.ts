import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseTable } from './entities/database-table.entity';
import { DatabaseColumn } from './entities/database-column.entity';
import { DatabaseRecord } from './entities/database-record.entity';
import { DatabaseService } from './database.service';
import { DatabaseResolver } from './database.resolver';
import { RecordsService } from './records.service';
import { RecordsResolver } from './records.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([DatabaseTable, DatabaseColumn, DatabaseRecord]),
  ],
  providers: [
    DatabaseService,
    DatabaseResolver,
    RecordsService,
    RecordsResolver,
  ],
  exports: [DatabaseService, RecordsService],
})
export class DatabaseModule {}

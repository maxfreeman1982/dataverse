import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Spreadsheet } from './entities/spreadsheet.entity';
import { Presentation } from './entities/presentation.entity';
import { OfficeService } from './office.service';
import { OfficeResolver } from './office.resolver';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Spreadsheet, Presentation]),
    WebsocketModule,
  ],
  providers: [OfficeService, OfficeResolver],
  exports: [OfficeService],
})
export class OfficeModule {}

import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ImportExportService } from './services/import-export.service';

/**
 * REST Controller for Import/Export operations
 * Provides file upload/download endpoints
 */
@Controller('football')
@UseGuards(JwtAuthGuard)
export class FootballController {
  constructor(private readonly importExportService: ImportExportService) {}

  /**
   * Import tracking data from CSV file
   * POST /football/matches/:id/tracking/import
   */
  @Post('matches/:id/tracking/import')
  @UseInterceptors(FileInterceptor('file'))
  async importTrackingData(
    @Param('id') matchId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const csvContent = file.buffer.toString('utf-8');
    const result = await this.importExportService.importTrackingDataCSV(
      matchId,
      csvContent,
      user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tracking data imported successfully',
      data: result,
    };
  }

  /**
   * Import match events from CSV file
   * POST /football/matches/:id/events/import
   */
  @Post('matches/:id/events/import')
  @UseInterceptors(FileInterceptor('file'))
  async importMatchEvents(
    @Param('id') matchId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const csvContent = file.buffer.toString('utf-8');
    const result = await this.importExportService.importMatchEventsCSV(
      matchId,
      csvContent,
      user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Match events imported successfully',
      data: result,
    };
  }

  /**
   * Export tactical analysis to JSON
   * GET /football/analyses/:id/export/json
   */
  @Get('analyses/:id/export/json')
  async exportAnalysisJSON(
    @Param('id') analysisId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const data = await this.importExportService.exportAnalysisJSON(
      analysisId,
      user.id,
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=analysis-${analysisId}.json`,
    );

    return res.send(JSON.stringify(data, null, 2));
  }

  /**
   * Export match statistics to Excel
   * GET /football/matches/:id/export/excel
   */
  @Get('matches/:id/export/excel')
  async exportMatchStatistics(
    @Param('id') matchId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const buffer = await this.importExportService.exportMatchStatisticsExcel(
      matchId,
      user.id,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=match-${matchId}-statistics.xlsx`,
    );

    return res.send(buffer);
  }

  /**
   * Export team statistics to Excel
   * GET /football/teams/:id/export/excel
   */
  @Get('teams/:id/export/excel')
  async exportTeamStatistics(
    @Param('id') teamId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const buffer = await this.importExportService.exportTeamStatisticsExcel(
      teamId,
      user.id,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=team-${teamId}-statistics.xlsx`,
    );

    return res.send(buffer);
  }

  /**
   * Get import/export documentation
   * GET /football/import-export/docs
   */
  @Get('import-export/docs')
  getDocumentation() {
    return {
      version: '1.0',
      endpoints: [
        {
          method: 'POST',
          path: '/football/matches/:id/tracking/import',
          description: 'Import tracking data from CSV',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer <token>',
          },
          body: {
            file: 'CSV file with tracking data',
          },
          csvFormat: {
            columns: [
              'timestamp',
              'frame',
              'period',
              'ballX',
              'ballY',
              'ballSpeed',
              'playerPositions (JSON array)',
            ],
            example: '0.0,0,first-half,0,0,0,"[{...}]"',
          },
        },
        {
          method: 'POST',
          path: '/football/matches/:id/events/import',
          description: 'Import match events from CSV',
          csvFormat: {
            columns: [
              'timestamp',
              'minute',
              'type',
              'team',
              'outcome',
              'locationX',
              'locationY',
              'playerId (optional)',
            ],
            example: '60.5,1,pass,home,success,10.5,-5.2,player-123',
          },
        },
        {
          method: 'GET',
          path: '/football/analyses/:id/export/json',
          description: 'Export tactical analysis to JSON',
          response: 'JSON file download',
        },
        {
          method: 'GET',
          path: '/football/matches/:id/export/excel',
          description: 'Export match statistics to Excel',
          response: 'Excel file (.xlsx) download',
        },
        {
          method: 'GET',
          path: '/football/teams/:id/export/excel',
          description: 'Export team statistics to Excel',
          response: 'Excel file (.xlsx) download',
        },
      ],
    };
  }
}

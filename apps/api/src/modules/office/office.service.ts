import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Spreadsheet } from './entities/spreadsheet.entity';
import { Presentation } from './entities/presentation.entity';
import {
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateSpreadsheetInput,
  UpdateSpreadsheetInput,
  CreatePresentationInput,
  UpdatePresentationInput,
} from './dto/office.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Spreadsheet)
    private spreadsheetRepository: Repository<Spreadsheet>,
    @InjectRepository(Presentation)
    private presentationRepository: Repository<Presentation>,
    private websocketGateway: WebsocketGateway,
  ) {}

  // ========== DOCUMENTS ==========

  async createDocument(
    input: CreateDocumentInput,
    userId: string,
  ): Promise<Document> {
    const document = this.documentRepository.create({
      ...input,
      createdById: userId,
      content: input.content || { type: 'doc', content: [] },
      wordCount: 0,
      characterCount: 0,
    });

    const saved = await this.documentRepository.save(document);
    const full = await this.getDocumentById(saved.id);

    this.websocketGateway.emitToUser(userId, 'document:created', {
      document: full,
    });

    return full;
  }

  async getDocumentById(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['createdBy', 'collaborators', 'lastEditedBy'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async getDocuments(userId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: [{ createdById: userId }],
      relations: ['createdBy', 'collaborators'],
      order: { updatedAt: 'DESC' },
    });
  }

  async updateDocument(
    input: UpdateDocumentInput,
    userId: string,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: input.id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check permissions
    if (document.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to edit this document');
    }

    // Update fields
    if (input.title !== undefined) document.title = input.title;
    if (input.content !== undefined) {
      document.content = input.content;
      // Calculate word count and character count
      const text = this.extractTextFromContent(input.content);
      document.wordCount = text.split(/\s+/).filter(Boolean).length;
      document.characterCount = text.length;
    }
    if (input.status !== undefined) document.status = input.status;
    if (input.visibility !== undefined) document.visibility = input.visibility;
    if (input.description !== undefined) document.description = input.description;
    if (input.icon !== undefined) document.icon = input.icon;
    if (input.tags !== undefined) document.tags = input.tags;

    document.lastEditedById = userId;

    const updated = await this.documentRepository.save(document);
    const full = await this.getDocumentById(updated.id);

    this.websocketGateway.emitToUser(userId, 'document:updated', {
      document: full,
    });

    return full;
  }

  async deleteDocument(id: string, userId: string): Promise<boolean> {
    const document = await this.documentRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to delete this document');
    }

    await this.documentRepository.remove(document);

    this.websocketGateway.emitToUser(userId, 'document:deleted', {
      documentId: id,
    });

    return true;
  }

  // ========== SPREADSHEETS ==========

  async createSpreadsheet(
    input: CreateSpreadsheetInput,
    userId: string,
  ): Promise<Spreadsheet> {
    const spreadsheet = this.spreadsheetRepository.create({
      ...input,
      createdById: userId,
      sheets: [
        {
          id: 'sheet1',
          name: 'Sheet 1',
          cells: {},
          rowCount: 100,
          columnCount: 26,
        },
      ],
      sheetCount: 1,
    });

    const saved = await this.spreadsheetRepository.save(spreadsheet);
    const full = await this.getSpreadsheetById(saved.id);

    this.websocketGateway.emitToUser(userId, 'spreadsheet:created', {
      spreadsheet: full,
    });

    return full;
  }

  async getSpreadsheetById(id: string): Promise<Spreadsheet> {
    const spreadsheet = await this.spreadsheetRepository.findOne({
      where: { id },
      relations: ['createdBy', 'collaborators'],
    });

    if (!spreadsheet) {
      throw new NotFoundException('Spreadsheet not found');
    }

    return spreadsheet;
  }

  async getSpreadsheets(userId: string): Promise<Spreadsheet[]> {
    return this.spreadsheetRepository.find({
      where: [{ createdById: userId }],
      relations: ['createdBy', 'collaborators'],
      order: { updatedAt: 'DESC' },
    });
  }

  async updateSpreadsheet(
    input: UpdateSpreadsheetInput,
    userId: string,
  ): Promise<Spreadsheet> {
    const spreadsheet = await this.spreadsheetRepository.findOne({
      where: { id: input.id },
    });

    if (!spreadsheet) {
      throw new NotFoundException('Spreadsheet not found');
    }

    if (spreadsheet.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to edit this spreadsheet');
    }

    if (input.title !== undefined) spreadsheet.title = input.title;
    if (input.sheets !== undefined) {
      spreadsheet.sheets = input.sheets;
      spreadsheet.sheetCount = input.sheets.length;
    }
    if (input.description !== undefined) spreadsheet.description = input.description;
    if (input.icon !== undefined) spreadsheet.icon = input.icon;
    if (input.tags !== undefined) spreadsheet.tags = input.tags;

    const updated = await this.spreadsheetRepository.save(spreadsheet);
    const full = await this.getSpreadsheetById(updated.id);

    this.websocketGateway.emitToUser(userId, 'spreadsheet:updated', {
      spreadsheet: full,
    });

    return full;
  }

  async deleteSpreadsheet(id: string, userId: string): Promise<boolean> {
    const spreadsheet = await this.spreadsheetRepository.findOne({ where: { id } });

    if (!spreadsheet) {
      throw new NotFoundException('Spreadsheet not found');
    }

    if (spreadsheet.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to delete this spreadsheet');
    }

    await this.spreadsheetRepository.remove(spreadsheet);

    this.websocketGateway.emitToUser(userId, 'spreadsheet:deleted', {
      spreadsheetId: id,
    });

    return true;
  }

  // ========== PRESENTATIONS ==========

  async createPresentation(
    input: CreatePresentationInput,
    userId: string,
  ): Promise<Presentation> {
    const presentation = this.presentationRepository.create({
      ...input,
      createdById: userId,
      slides: [
        {
          id: 'slide1',
          order: 0,
          content: { type: 'doc', content: [] },
          layout: 'title',
          background: '#ffffff',
        },
      ],
      slideCount: 1,
      theme: input.theme || 'default',
    });

    const saved = await this.presentationRepository.save(presentation);
    const full = await this.getPresentationById(saved.id);

    this.websocketGateway.emitToUser(userId, 'presentation:created', {
      presentation: full,
    });

    return full;
  }

  async getPresentationById(id: string): Promise<Presentation> {
    const presentation = await this.presentationRepository.findOne({
      where: { id },
      relations: ['createdBy', 'collaborators'],
    });

    if (!presentation) {
      throw new NotFoundException('Presentation not found');
    }

    return presentation;
  }

  async getPresentations(userId: string): Promise<Presentation[]> {
    return this.presentationRepository.find({
      where: [{ createdById: userId }],
      relations: ['createdBy', 'collaborators'],
      order: { updatedAt: 'DESC' },
    });
  }

  async updatePresentation(
    input: UpdatePresentationInput,
    userId: string,
  ): Promise<Presentation> {
    const presentation = await this.presentationRepository.findOne({
      where: { id: input.id },
    });

    if (!presentation) {
      throw new NotFoundException('Presentation not found');
    }

    if (presentation.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to edit this presentation');
    }

    if (input.title !== undefined) presentation.title = input.title;
    if (input.slides !== undefined) {
      presentation.slides = input.slides;
      presentation.slideCount = input.slides.length;
    }
    if (input.description !== undefined) presentation.description = input.description;
    if (input.icon !== undefined) presentation.icon = input.icon;
    if (input.theme !== undefined) presentation.theme = input.theme;
    if (input.tags !== undefined) presentation.tags = input.tags;

    const updated = await this.presentationRepository.save(presentation);
    const full = await this.getPresentationById(updated.id);

    this.websocketGateway.emitToUser(userId, 'presentation:updated', {
      presentation: full,
    });

    return full;
  }

  async deletePresentation(id: string, userId: string): Promise<boolean> {
    const presentation = await this.presentationRepository.findOne({ where: { id } });

    if (!presentation) {
      throw new NotFoundException('Presentation not found');
    }

    if (presentation.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to delete this presentation');
    }

    await this.presentationRepository.remove(presentation);

    this.websocketGateway.emitToUser(userId, 'presentation:deleted', {
      presentationId: id,
    });

    return true;
  }

  // Helper methods
  private extractTextFromContent(content: any): string {
    if (!content || !content.content) return '';

    let text = '';
    const traverse = (node: any) => {
      if (node.text) {
        text += node.text + ' ';
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    };

    traverse(content);
    return text.trim();
  }
}

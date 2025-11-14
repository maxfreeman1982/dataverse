import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { OfficeService } from './office.service';
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

@Resolver()
@UseGuards(GqlAuthGuard)
export class OfficeResolver {
  constructor(private officeService: OfficeService) {}

  // ========== DOCUMENTS ==========

  @Mutation(() => Document)
  async createDocument(
    @Args('input') input: CreateDocumentInput,
    @CurrentUser() user: User,
  ): Promise<Document> {
    return this.officeService.createDocument(input, user.id);
  }

  @Query(() => Document)
  async document(@Args('id', { type: () => ID }) id: string): Promise<Document> {
    return this.officeService.getDocumentById(id);
  }

  @Query(() => [Document])
  async documents(@CurrentUser() user: User): Promise<Document[]> {
    return this.officeService.getDocuments(user.id);
  }

  @Mutation(() => Document)
  async updateDocument(
    @Args('input') input: UpdateDocumentInput,
    @CurrentUser() user: User,
  ): Promise<Document> {
    return this.officeService.updateDocument(input, user.id);
  }

  @Mutation(() => Boolean)
  async deleteDocument(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.officeService.deleteDocument(id, user.id);
  }

  // ========== SPREADSHEETS ==========

  @Mutation(() => Spreadsheet)
  async createSpreadsheet(
    @Args('input') input: CreateSpreadsheetInput,
    @CurrentUser() user: User,
  ): Promise<Spreadsheet> {
    return this.officeService.createSpreadsheet(input, user.id);
  }

  @Query(() => Spreadsheet)
  async spreadsheet(@Args('id', { type: () => ID }) id: string): Promise<Spreadsheet> {
    return this.officeService.getSpreadsheetById(id);
  }

  @Query(() => [Spreadsheet])
  async spreadsheets(@CurrentUser() user: User): Promise<Spreadsheet[]> {
    return this.officeService.getSpreadsheets(user.id);
  }

  @Mutation(() => Spreadsheet)
  async updateSpreadsheet(
    @Args('input') input: UpdateSpreadsheetInput,
    @CurrentUser() user: User,
  ): Promise<Spreadsheet> {
    return this.officeService.updateSpreadsheet(input, user.id);
  }

  @Mutation(() => Boolean)
  async deleteSpreadsheet(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.officeService.deleteSpreadsheet(id, user.id);
  }

  // ========== PRESENTATIONS ==========

  @Mutation(() => Presentation)
  async createPresentation(
    @Args('input') input: CreatePresentationInput,
    @CurrentUser() user: User,
  ): Promise<Presentation> {
    return this.officeService.createPresentation(input, user.id);
  }

  @Query(() => Presentation)
  async presentation(@Args('id', { type: () => ID }) id: string): Promise<Presentation> {
    return this.officeService.getPresentationById(id);
  }

  @Query(() => [Presentation])
  async presentations(@CurrentUser() user: User): Promise<Presentation[]> {
    return this.officeService.getPresentations(user.id);
  }

  @Mutation(() => Presentation)
  async updatePresentation(
    @Args('input') input: UpdatePresentationInput,
    @CurrentUser() user: User,
  ): Promise<Presentation> {
    return this.officeService.updatePresentation(input, user.id);
  }

  @Mutation(() => Boolean)
  async deletePresentation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.officeService.deletePresentation(id, user.id);
  }
}

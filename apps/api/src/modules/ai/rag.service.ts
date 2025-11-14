import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DocumentEmbedding, DocumentType } from './entities/document-embedding.entity';
import { DatabaseTable } from '../database/entities/database-table.entity';
import { Page } from '../builder/entities/page.entity';
import { Message } from '../chat/entities/message.entity';

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    @InjectRepository(DocumentEmbedding)
    private readonly embeddingRepository: Repository<DocumentEmbedding>,
    @InjectRepository(DatabaseTable)
    private readonly tableRepository: Repository<DatabaseTable>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Generate embeddings for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Index a document with embeddings
   */
  async indexDocument(
    documentType: DocumentType,
    documentId: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<DocumentEmbedding> {
    // Check if document already indexed
    const existing = await this.embeddingRepository.findOne({
      where: { documentType, documentId },
    });

    // Generate embedding
    const embedding = await this.generateEmbedding(content);

    if (existing) {
      // Update existing
      existing.content = content;
      existing.embedding = embedding;
      existing.metadata = metadata;
      return this.embeddingRepository.save(existing);
    } else {
      // Create new
      const doc = this.embeddingRepository.create({
        documentType,
        documentId,
        content,
        embedding,
        metadata,
      });
      return this.embeddingRepository.save(doc);
    }
  }

  /**
   * Search documents using semantic similarity
   */
  async searchDocuments(
    query: string,
    limit = 5,
  ): Promise<Array<{ document: DocumentEmbedding; score: number }>> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Get all documents (in production, you'd use a vector database)
    const allDocs = await this.embeddingRepository.find({
      where: { embedding: Not(null) as any },
    });

    // Calculate similarities
    const results = allDocs
      .map((doc) => ({
        document: doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding!),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  /**
   * Index all workspace tables
   */
  async indexAllTables(): Promise<number> {
    const tables = await this.tableRepository.find({
      relations: ['columns'],
    });

    let indexed = 0;
    for (const table of tables) {
      const content = `Table: ${table.name}
Description: ${table.description || 'No description'}
Columns: ${table.columns.map((c) => `${c.name} (${c.type})`).join(', ')}`;

      await this.indexDocument(DocumentType.TABLE, table.id, content, {
        name: table.name,
        slug: table.slug,
        columnCount: table.columns.length,
      });

      indexed++;
    }

    this.logger.log(`Indexed ${indexed} tables`);
    return indexed;
  }

  /**
   * Index all pages
   */
  async indexAllPages(): Promise<number> {
    const pages = await this.pageRepository.find({
      relations: ['components'],
      where: { status: 'published' as any },
    });

    let indexed = 0;
    for (const page of pages) {
      const componentTexts = page.components
        ?.map((c) => {
          if (c.properties?.content) return c.properties.content;
          if (c.properties?.title) return c.properties.title;
          return '';
        })
        .filter(Boolean)
        .join(' ');

      const content = `Page: ${page.name}
Description: ${page.description || 'No description'}
Content: ${componentTexts || 'No content'}`;

      await this.indexDocument(DocumentType.PAGE, page.id, content, {
        name: page.name,
        slug: page.slug,
        componentCount: page.components?.length || 0,
      });

      indexed++;
    }

    this.logger.log(`Indexed ${indexed} pages`);
    return indexed;
  }

  /**
   * Get relevant context for a query
   */
  async getRelevantContext(query: string, limit = 3): Promise<string> {
    const results = await this.searchDocuments(query, limit);

    if (results.length === 0) {
      return 'No relevant documents found in the workspace.';
    }

    const context = results
      .map((r, i) => `[Document ${i + 1}] (relevance: ${(r.score * 100).toFixed(1)}%)
${r.document.content}`)
      .join('\n\n');

    return context;
  }

  /**
   * Delete document embeddings
   */
  async deleteDocument(
    documentType: DocumentType,
    documentId: string,
  ): Promise<boolean> {
    const result = await this.embeddingRepository.delete({
      documentType,
      documentId,
    });
    return result.affected > 0;
  }

  /**
   * Get embedding statistics
   */
  async getStats(): Promise<{
    total: number;
    byType: Record<DocumentType, number>;
  }> {
    const all = await this.embeddingRepository.find();
    const byType = {} as Record<DocumentType, number>;

    for (const type of Object.values(DocumentType)) {
      byType[type] = all.filter((d) => d.documentType === type).length;
    }

    return {
      total: all.length,
      byType,
    };
  }
}

// Import Not for the query
import { Not } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DatabaseService } from '../database/database.service';
import { RecordsService } from '../database/records.service';

export interface AIResponse {
  answer: string;
  context?: string;
  suggestedActions?: string[];
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly recordsService: RecordsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not found, AI features will be limited');
    }
  }

  async chat(message: string, userId: string): Promise<AIResponse> {
    if (!this.openai) {
      return {
        answer: 'AI features are not available. Please configure OPENAI_API_KEY.',
        context: 'Configuration missing',
      };
    }

    try {
      // Get user context (tables available)
      const tables = await this.databaseService.findAll();
      const tableContext = tables
        .map(
          (t) =>
            `- ${t.name} (${t.columns.length} columns: ${t.columns.map((c) => c.name).join(', ')})`,
        )
        .join('\n');

      const systemPrompt = `You are DataVerse OS AI Assistant. You help users manage their data and workspaces.

Available tables:
${tableContext}

You can:
- Answer questions about data structure
- Suggest queries or operations
- Help with data organization
- Provide insights

Be concise and helpful. If you suggest actions, format them clearly.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const answer = completion.choices[0]?.message?.content || 'No response generated';

      return {
        answer,
        context: `Based on ${tables.length} tables in your workspace`,
      };
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      return {
        answer: 'Sorry, I encountered an error processing your request.',
        context: 'Error occurred',
      };
    }
  }

  async queryData(
    question: string,
    tableId: string,
    userId: string,
  ): Promise<AIResponse> {
    if (!this.openai) {
      return {
        answer: 'AI features are not available. Please configure OPENAI_API_KEY.',
      };
    }

    try {
      // Get table schema
      const table = await this.databaseService.findOne(tableId);
      const records = await this.recordsService.findAll(tableId, { limit: 10 });

      const schemaContext = table.columns
        .map((c) => `${c.name} (${c.type})${c.isRequired ? ' *required' : ''}`)
        .join(', ');

      const sampleData = records.records
        .slice(0, 3)
        .map((r) => JSON.stringify(r.data))
        .join('\n');

      const systemPrompt = `You are analyzing data from table "${table.name}".

Schema: ${schemaContext}

Sample data:
${sampleData}

Answer the user's question based on this data structure and samples. Be specific and data-driven.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.5,
        max_tokens: 400,
      });

      const answer = completion.choices[0]?.message?.content || 'No response generated';

      return {
        answer,
        context: `Analyzed ${records.total} records from ${table.name}`,
      };
    } catch (error) {
      this.logger.error('Data query error:', error);
      return {
        answer: 'Sorry, I encountered an error analyzing your data.',
      };
    }
  }

  async suggestColumns(tableName: string, description: string): Promise<AIResponse> {
    if (!this.openai) {
      return {
        answer: 'AI features are not available.',
      };
    }

    try {
      const prompt = `Suggest database columns for a table named "${tableName}".
Description: ${description}

Provide a JSON array of column suggestions with: name, type (text/number/date/email/url/boolean), and description.
Types available: text, number, date, datetime, email, url, phone, boolean, select, multi_select, relation, file, json, rich_text

Example format:
[
  { "name": "Email", "type": "email", "description": "User email address" },
  { "name": "Age", "type": "number", "description": "User age" }
]`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      });

      const answer = completion.choices[0]?.message?.content || '[]';

      return {
        answer,
        context: 'Column suggestions generated',
      };
    } catch (error) {
      this.logger.error('Column suggestion error:', error);
      return {
        answer: '[]',
        context: 'Error generating suggestions',
      };
    }
  }
}

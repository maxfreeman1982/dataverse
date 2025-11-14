import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

export interface EmailAnalysis {
  summary: string;
  category: string;
  sentimentScore: number;
  suggestedReplies: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

@Injectable()
export class MailAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeEmail(
    subject: string,
    body: string,
  ): Promise<EmailAnalysis> {
    const prompt = `Analyze this email and provide:
1. A brief summary (2-3 sentences)
2. Category (e.g., Work, Personal, Marketing, Support, Urgent, FYI)
3. Sentiment score (-1 to 1, where -1 is negative, 0 is neutral, 1 is positive)
4. 3 suggested brief replies
5. Priority level (low, normal, high, urgent)

Subject: ${subject}
Body: ${body}

Respond in JSON format:
{
  "summary": "...",
  "category": "...",
  "sentimentScore": 0.5,
  "suggestedReplies": ["...", "...", "..."],
  "priority": "normal"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI email assistant. Analyze emails and provide structured insights in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = JSON.parse(
      response.choices[0].message.content || '{}',
    ) as EmailAnalysis;
    return result;
  }

  async generateReply(
    originalSubject: string,
    originalBody: string,
    replyIntent: string,
  ): Promise<string> {
    const prompt = `Generate a professional email reply based on:

Original Subject: ${originalSubject}
Original Email: ${originalBody}

Reply Intent: ${replyIntent}

Write a concise, professional reply.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional email writing assistant. Generate clear, concise, and professional email replies.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content || '';
  }

  async composeEmail(
    prompt: string,
    context?: string,
  ): Promise<{ subject: string; body: string }> {
    const systemPrompt = context
      ? `You are an email writing assistant. Use the following context to help compose the email:\n${context}`
      : 'You are an email writing assistant. Generate professional emails based on user prompts.';

    const userPrompt = `Compose a professional email based on this request:

${prompt}

Respond in JSON format:
{
  "subject": "...",
  "body": "..."
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      subject: result.subject || '',
      body: result.body || '',
    };
  }

  async searchEmails(query: string, emailBodies: string[]): Promise<number[]> {
    // Simple relevance scoring using keyword matching
    // In production, this would use embeddings for semantic search
    const scores = emailBodies.map((body) => {
      const queryLower = query.toLowerCase();
      const bodyLower = body.toLowerCase();

      // Count occurrences of query words
      const queryWords = queryLower.split(/\s+/);
      let score = 0;

      for (const word of queryWords) {
        const occurrences = (bodyLower.match(new RegExp(word, 'g')) || []).length;
        score += occurrences;
      }

      return score;
    });

    return scores;
  }

  async categorizeEmails(
    emails: Array<{ subject: string; body: string }>,
  ): Promise<string[]> {
    // Batch categorization for efficiency
    const categories: string[] = [];

    for (const email of emails) {
      const analysis = await this.analyzeEmail(email.subject, email.body);
      categories.push(analysis.category);
    }

    return categories;
  }
}

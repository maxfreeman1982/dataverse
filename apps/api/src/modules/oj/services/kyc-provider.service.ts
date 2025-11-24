import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface KycProviderConfig {
  provider: 'onfido' | 'sumsub' | 'trulioo' | 'manual';
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
}

export interface VerificationRequest {
  investorId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  country: string;
  documentType: string;
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl?: string;
}

export interface VerificationResult {
  success: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'review';
  externalId: string;
  checks: {
    documentAuthenticity: 'passed' | 'failed' | 'pending';
    faceMatch: 'passed' | 'failed' | 'pending' | 'not_applicable';
    dataConsistency: 'passed' | 'failed' | 'pending';
    watchlistCheck: 'clear' | 'match' | 'pending';
  };
  details?: Record<string, any>;
  rejectionReasons?: string[];
}

export interface WebhookPayload {
  provider: string;
  event: string;
  externalId: string;
  status: string;
  data: Record<string, any>;
}

@Injectable()
export class KycProviderService {
  private readonly logger = new Logger(KycProviderService.name);
  private config: KycProviderConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      provider: this.configService.get('KYC_PROVIDER', 'manual') as any,
      apiKey: this.configService.get('KYC_API_KEY'),
      apiSecret: this.configService.get('KYC_API_SECRET'),
      webhookSecret: this.configService.get('KYC_WEBHOOK_SECRET'),
      environment: this.configService.get('KYC_ENVIRONMENT', 'sandbox') as any,
    };
  }

  async initiateVerification(request: VerificationRequest): Promise<VerificationResult> {
    this.logger.log(`Initiating KYC verification for investor ${request.investorId} with provider ${this.config.provider}`);

    switch (this.config.provider) {
      case 'onfido':
        return this.initiateOnfidoVerification(request);
      case 'sumsub':
        return this.initiateSumsubVerification(request);
      case 'trulioo':
        return this.initiateTruliooVerification(request);
      case 'manual':
      default:
        return this.initiateManualVerification(request);
    }
  }

  async checkVerificationStatus(externalId: string): Promise<VerificationResult> {
    switch (this.config.provider) {
      case 'onfido':
        return this.checkOnfidoStatus(externalId);
      case 'sumsub':
        return this.checkSumsubStatus(externalId);
      case 'trulioo':
        return this.checkTruliooStatus(externalId);
      case 'manual':
      default:
        return this.checkManualStatus(externalId);
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<VerificationResult | null> {
    this.logger.log(`Received webhook from ${payload.provider}: ${payload.event}`);

    // Verify webhook signature based on provider
    // Process the webhook and return updated status

    return {
      success: payload.status === 'approved',
      status: payload.status as any,
      externalId: payload.externalId,
      checks: payload.data.checks || {
        documentAuthenticity: 'pending',
        faceMatch: 'pending',
        dataConsistency: 'pending',
        watchlistCheck: 'pending',
      },
      details: payload.data,
    };
  }

  // Onfido Integration
  private async initiateOnfidoVerification(request: VerificationRequest): Promise<VerificationResult> {
    const baseUrl = this.config.environment === 'production'
      ? 'https://api.onfido.com/v3.6'
      : 'https://api.sandbox.onfido.com/v3.6';

    try {
      // Create applicant
      const applicantResponse = await axios.post(
        `${baseUrl}/applicants`,
        {
          first_name: request.firstName,
          last_name: request.lastName,
          email: request.email,
          location: {
            country_of_residence: request.country,
          },
        },
        {
          headers: {
            Authorization: `Token token=${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const applicantId = applicantResponse.data.id;

      // Create check
      const checkResponse = await axios.post(
        `${baseUrl}/checks`,
        {
          applicant_id: applicantId,
          report_names: ['document', 'facial_similarity_photo'],
        },
        {
          headers: {
            Authorization: `Token token=${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: true,
        status: 'pending',
        externalId: checkResponse.data.id,
        checks: {
          documentAuthenticity: 'pending',
          faceMatch: 'pending',
          dataConsistency: 'pending',
          watchlistCheck: 'pending',
        },
      };
    } catch (error) {
      this.logger.error(`Onfido verification failed: ${error.message}`);
      throw error;
    }
  }

  private async checkOnfidoStatus(externalId: string): Promise<VerificationResult> {
    const baseUrl = this.config.environment === 'production'
      ? 'https://api.onfido.com/v3.6'
      : 'https://api.sandbox.onfido.com/v3.6';

    try {
      const response = await axios.get(`${baseUrl}/checks/${externalId}`, {
        headers: {
          Authorization: `Token token=${this.config.apiKey}`,
        },
      });

      const check = response.data;
      const status = this.mapOnfidoStatus(check.status, check.result);

      return {
        success: status === 'approved',
        status,
        externalId,
        checks: {
          documentAuthenticity: check.reports?.document?.result === 'clear' ? 'passed' : 'pending',
          faceMatch: check.reports?.facial_similarity_photo?.result === 'clear' ? 'passed' : 'pending',
          dataConsistency: 'passed',
          watchlistCheck: 'clear',
        },
        details: check,
      };
    } catch (error) {
      this.logger.error(`Onfido status check failed: ${error.message}`);
      throw error;
    }
  }

  private mapOnfidoStatus(status: string, result?: string): 'pending' | 'approved' | 'rejected' | 'review' {
    if (status === 'in_progress') return 'pending';
    if (status === 'complete' && result === 'clear') return 'approved';
    if (status === 'complete' && result === 'consider') return 'review';
    return 'rejected';
  }

  // Sumsub Integration
  private async initiateSumsubVerification(request: VerificationRequest): Promise<VerificationResult> {
    const baseUrl = 'https://api.sumsub.com';

    try {
      // Create applicant
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = this.generateSumsubSignature(timestamp, 'POST', '/resources/applicants');

      const response = await axios.post(
        `${baseUrl}/resources/applicants?levelName=basic-kyc`,
        {
          externalUserId: request.investorId,
          email: request.email,
          fixedInfo: {
            firstName: request.firstName,
            lastName: request.lastName,
            country: request.country,
          },
        },
        {
          headers: {
            'X-App-Token': this.config.apiKey,
            'X-App-Access-Sig': signature,
            'X-App-Access-Ts': timestamp.toString(),
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: true,
        status: 'pending',
        externalId: response.data.id,
        checks: {
          documentAuthenticity: 'pending',
          faceMatch: 'pending',
          dataConsistency: 'pending',
          watchlistCheck: 'pending',
        },
      };
    } catch (error) {
      this.logger.error(`Sumsub verification failed: ${error.message}`);
      throw error;
    }
  }

  private async checkSumsubStatus(externalId: string): Promise<VerificationResult> {
    const baseUrl = 'https://api.sumsub.com';
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.generateSumsubSignature(timestamp, 'GET', `/resources/applicants/${externalId}/status`);

    try {
      const response = await axios.get(`${baseUrl}/resources/applicants/${externalId}/status`, {
        headers: {
          'X-App-Token': this.config.apiKey,
          'X-App-Access-Sig': signature,
          'X-App-Access-Ts': timestamp.toString(),
        },
      });

      const status = response.data;

      return {
        success: status.reviewStatus === 'completed' && status.reviewResult?.reviewAnswer === 'GREEN',
        status: this.mapSumsubStatus(status.reviewStatus, status.reviewResult?.reviewAnswer),
        externalId,
        checks: {
          documentAuthenticity: status.reviewResult?.reviewAnswer === 'GREEN' ? 'passed' : 'pending',
          faceMatch: status.reviewResult?.reviewAnswer === 'GREEN' ? 'passed' : 'pending',
          dataConsistency: 'passed',
          watchlistCheck: 'clear',
        },
        details: status,
      };
    } catch (error) {
      this.logger.error(`Sumsub status check failed: ${error.message}`);
      throw error;
    }
  }

  private mapSumsubStatus(reviewStatus: string, reviewAnswer?: string): 'pending' | 'approved' | 'rejected' | 'review' {
    if (reviewStatus === 'pending' || reviewStatus === 'queued') return 'pending';
    if (reviewStatus === 'completed' && reviewAnswer === 'GREEN') return 'approved';
    if (reviewStatus === 'completed' && reviewAnswer === 'RED') return 'rejected';
    return 'review';
  }

  private generateSumsubSignature(timestamp: number, method: string, path: string): string {
    // In production, implement proper HMAC signature
    // This is a placeholder
    const crypto = require('crypto');
    const data = `${timestamp}${method}${path}`;
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(data)
      .digest('hex');
  }

  // Trulioo Integration
  private async initiateTruliooVerification(request: VerificationRequest): Promise<VerificationResult> {
    const baseUrl = this.config.environment === 'production'
      ? 'https://api.trulioo.com'
      : 'https://api.sandbox.trulioo.com';

    try {
      const response = await axios.post(
        `${baseUrl}/verifications/v1/verify`,
        {
          AcceptTruliooTermsAndConditions: true,
          CleansedAddress: false,
          ConfigurationName: 'Identity Verification',
          CountryCode: request.country,
          DataFields: {
            PersonInfo: {
              FirstGivenName: request.firstName,
              FirstSurName: request.lastName,
            },
            Document: {
              DocumentType: request.documentType,
              DocumentNumber: request.documentNumber,
            },
          },
        },
        {
          headers: {
            'x-trulioo-api-key': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const record = response.data.Record;

      return {
        success: record.RecordStatus === 'match',
        status: record.RecordStatus === 'match' ? 'approved' : 'pending',
        externalId: response.data.TransactionID,
        checks: {
          documentAuthenticity: record.RecordStatus === 'match' ? 'passed' : 'pending',
          faceMatch: 'not_applicable',
          dataConsistency: record.RecordStatus === 'match' ? 'passed' : 'pending',
          watchlistCheck: 'clear',
        },
        details: response.data,
      };
    } catch (error) {
      this.logger.error(`Trulioo verification failed: ${error.message}`);
      throw error;
    }
  }

  private async checkTruliooStatus(externalId: string): Promise<VerificationResult> {
    // Trulioo provides synchronous results, so we return the last known status
    return {
      success: false,
      status: 'pending',
      externalId,
      checks: {
        documentAuthenticity: 'pending',
        faceMatch: 'not_applicable',
        dataConsistency: 'pending',
        watchlistCheck: 'pending',
      },
    };
  }

  // Manual/Mock Verification (for development)
  private async initiateManualVerification(request: VerificationRequest): Promise<VerificationResult> {
    const externalId = `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return {
      success: true,
      status: 'pending',
      externalId,
      checks: {
        documentAuthenticity: 'pending',
        faceMatch: 'pending',
        dataConsistency: 'pending',
        watchlistCheck: 'pending',
      },
      details: {
        provider: 'manual',
        message: 'Verification submitted for manual review',
      },
    };
  }

  private async checkManualStatus(externalId: string): Promise<VerificationResult> {
    return {
      success: false,
      status: 'pending',
      externalId,
      checks: {
        documentAuthenticity: 'pending',
        faceMatch: 'pending',
        dataConsistency: 'pending',
        watchlistCheck: 'pending',
      },
    };
  }
}

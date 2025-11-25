import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: twilio.Twilio;
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials not configured. SMS service disabled.');
    }
  }

  async sendSMS(to: string, message: string): Promise<void> {
    if (!this.twilioClient) {
      this.logger.warn('SMS not sent (Twilio not configured):', message);
      return;
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to,
      });
      this.logger.log(`SMS sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}:`, error.message);
      throw new Error('Failed to send SMS');
    }
  }

  /**
   * Send a 2FA verification code via SMS
   */
  async sendTwoFactorCode(phoneNumber: string, code: string): Promise<void> {
    const message = `Votre code de vérification OJ Investment: ${code}. Valide pendant 10 minutes.`;
    await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send OTP for phone verification
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    const message = `Votre code OTP: ${otp}. Ne le partagez avec personne.`;
    await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send investment confirmation SMS
   */
  async sendInvestmentConfirmation(
    phoneNumber: string,
    projectName: string,
    amount: number,
  ): Promise<void> {
    const message = `✅ Investissement confirmé: €${amount.toLocaleString()} dans "${projectName}". Merci pour votre confiance!`;
    await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send return payment notification
   */
  async sendReturnPaymentNotification(
    phoneNumber: string,
    amount: number,
    projectName: string,
  ): Promise<void> {
    const message = `💰 Rendement reçu: €${amount.toLocaleString()} du projet "${projectName}". Consultez votre portefeuille.`;
    await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send KYC approval notification
   */
  async sendKYCApprovalNotification(phoneNumber: string, name: string): Promise<void> {
    const message = `🎉 Félicitations ${name}! Votre vérification KYC est approuvée. Vous pouvez maintenant investir.`;
    await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send KYC rejection notification
   */
  async sendKYCRejectionNotification(phoneNumber: string, reason: string): Promise<void> {
    const message = `❌ KYC non approuvé. Raison: ${reason}. Veuillez soumettre à nouveau vos documents.`;
    await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send withdrawal confirmation
   */
  async sendWithdrawalConfirmation(
    phoneNumber: string,
    amount: number,
    estimatedDate: string,
  ): Promise<void> {
    const message = `💸 Retrait de €${amount.toLocaleString()} confirmé. Arrivée estimée: ${estimatedDate}.`;
    await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send project update alert
   */
  async sendProjectUpdateAlert(
    phoneNumber: string,
    projectName: string,
    updateType: string,
  ): Promise<void> {
    const message = `📢 Mise à jour "${projectName}": ${updateType}. Consultez l'application pour plus de détails.`;
    await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send security alert
   */
  async sendSecurityAlert(phoneNumber: string, alertMessage: string): Promise<void> {
    const message = `🔒 Alerte sécurité: ${alertMessage}. Si ce n'est pas vous, contactez-nous immédiatement.`;
    await this.sendSMS(phoneNumber, message);
  }
}

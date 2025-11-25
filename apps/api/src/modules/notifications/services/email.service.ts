import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      this.logger.warn('SENDGRID_API_KEY not set - email features disabled');
    }
    this.fromEmail = this.configService.get('SENDGRID_FROM_EMAIL', 'noreply@ojinvestment.com');
    this.fromName = this.configService.get('SENDGRID_FROM_NAME', 'OJ Investment');
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await sgMail.send({
        from: { email: this.fromEmail, name: this.fromName },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <h1>Bienvenue sur OJ Investment Platform, ${name}!</h1>
      <p>Merci de rejoindre notre plateforme d'investissement.</p>
      <p>Commencez dès maintenant à investir dans des projets vérifiés.</p>
      <a href="${this.configService.get('APP_URL')}/projects">Voir les projets</a>
    `;
    await this.sendEmail({ to: email, subject: 'Bienvenue !', html });
  }

  async sendInvestmentConfirmation(email: string, projectName: string, amount: number): Promise<void> {
    const html = `
      <h1>Investissement confirmé !</h1>
      <p>Votre investissement de €${amount.toLocaleString()} dans "${projectName}" a été confirmé.</p>
      <p>Vous pouvez suivre votre investissement dans votre portfolio.</p>
    `;
    await this.sendEmail({ to: email, subject: 'Investissement confirmé', html });
  }

  async sendReturnPaymentNotification(email: string, amount: number, projectName: string): Promise<void> {
    const html = `
      <h1>Paiement de rendement reçu</h1>
      <p>Vous avez reçu €${amount.toLocaleString()} de rendement du projet "${projectName}".</p>
      <p>Le montant a été crédité sur votre wallet.</p>
    `;
    await this.sendEmail({ to: email, subject: 'Rendement reçu', html });
  }

  async sendKYCApprovalNotification(email: string, name: string): Promise<void> {
    const html = `
      <h1>KYC Approuvé !</h1>
      <p>Bonjour ${name},</p>
      <p>Votre vérification KYC a été approuvée. Vous pouvez maintenant investir sans limites.</p>
    `;
    await this.sendEmail({ to: email, subject: 'KYC Approuvé', html });
  }

  async sendProjectApprovalNotification(email: string, projectName: string, approved: boolean): Promise<void> {
    const html = approved
      ? `<h1>Projet Approuvé !</h1><p>Votre projet "${projectName}" a été approuvé et est maintenant visible.</p>`
      : `<h1>Projet Rejeté</h1><p>Votre projet "${projectName}" nécessite des modifications.</p>`;
    await this.sendEmail({ to: email, subject: `Projet ${approved ? 'Approuvé' : 'Rejeté'}`, html });
  }

  async sendTwoFactorCode(email: string, code: string): Promise<void> {
    const html = `
      <h1>Code de vérification</h1>
      <p>Votre code de vérification est : <strong>${code}</strong></p>
      <p>Ce code expire dans 10 minutes.</p>
    `;
    await this.sendEmail({ to: email, subject: 'Code de vérification 2FA', html });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Réinitialisation du mot de passe</h1>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
      <p>Ce lien expire dans 1 heure.</p>
    `;
    await this.sendEmail({ to: email, subject: 'Réinitialisation du mot de passe', html });
  }
}

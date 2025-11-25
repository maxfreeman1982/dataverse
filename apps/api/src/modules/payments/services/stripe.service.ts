import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!apiKey) {
      this.logger.warn('STRIPE_SECRET_KEY not set - payment features disabled');
      return;
    }
    this.stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' });
  }

  // Create Payment Intent for Investment
  async createPaymentIntent(amount: number, currency = 'eur', metadata?: any): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: { enabled: true },
      });
    } catch (error) {
      this.logger.error(`Payment intent creation failed: ${error.message}`);
      throw error;
    }
  }

  // Create Customer
  async createCustomer(email: string, name: string, metadata?: any): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({ email, name, metadata });
    } catch (error) {
      this.logger.error(`Customer creation failed: ${error.message}`);
      throw error;
    }
  }

  // Retrieve Payment Intent
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  // Create SEPA Direct Debit
  async createSepaDebit(customerId: string, amount: number): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      customer: customerId,
      payment_method_types: ['sepa_debit'],
    });
  }

  // Refund Payment
  async refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }

  // Webhook Handler
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  // Create Payout
  async createPayout(amount: number, destination: string): Promise<Stripe.Payout> {
    return await this.stripe.payouts.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      destination,
    });
  }
}

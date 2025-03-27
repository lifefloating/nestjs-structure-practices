import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import Stripe from 'stripe';

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerDto {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly config: ConfigService) {}

  private getStripe(): Stripe {
    if (!this.stripe) {
      const stripeConfig = this.config.getStripeConfig();
      this.stripe = new Stripe(stripeConfig.secretKey, {
        apiVersion: stripeConfig.apiVersion as Stripe.LatestApiVersion,
      });
      this.logger.log('Stripe service initialized');
    }
    return this.stripe;
  }

  async createPaymentIntent(data: CreatePaymentIntentDto): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.getStripe().paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        metadata: data.metadata,
      });
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`, error.stack);
      throw error;
    }
  }

  async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.getStripe().paymentIntents.retrieve(id);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createCustomer(data: CreateCustomerDto): Promise<Stripe.Customer> {
    try {
      return await this.getStripe().customers.create({
        email: data.email,
        name: data.name,
        metadata: data.metadata,
      });
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    try {
      return await this.getStripe().setupIntents.create({
        customer: customerId,
        usage: 'off_session',
      });
    } catch (error) {
      this.logger.error(`Failed to create setup intent: ${error.message}`, error.stack);
      throw error;
    }
  }

  async constructWebhookEvent(payload: string, signature: string): Promise<Stripe.Event> {
    try {
      const webhookSecret = this.config.getStripeConfig().webhookSecret;
      return await this.getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Failed to construct webhook event: ${error.message}`, error.stack);
      throw error;
    }
  }
}

import { Controller, Post, Body, Param, Get, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiHeader } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { FastifyRequest } from 'fastify';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test Stripe integration' })
  @ApiResponse({ status: 200, description: 'Stripe integration is working' })
  test() {
    return { status: 'ok', message: 'Stripe integration is working' };
  }

  @Post('payment-intents')
  @ApiOperation({ summary: 'Create a payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(createPaymentIntentDto);
  }

  @Get('payment-intents/:id')
  @ApiOperation({ summary: 'Retrieve a payment intent' })
  @ApiParam({ name: 'id', description: 'Payment intent ID' })
  @ApiResponse({ status: 200, description: 'Payment intent retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment intent not found' })
  async retrievePaymentIntent(@Param('id') id: string) {
    return this.stripeService.retrievePaymentIntent(id);
  }

  @Post('customers')
  @ApiOperation({ summary: 'Create a customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.stripeService.createCustomer(createCustomerDto);
  }

  @Post('setup-intents')
  @ApiOperation({ summary: 'Create a setup intent for a customer' })
  @ApiResponse({ status: 201, description: 'Setup intent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSetupIntent(@Body('customerId') customerId: string) {
    return this.stripeService.createSetupIntent(customerId);
  }

  @Post('webhooks')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({ name: 'stripe-signature', description: 'Stripe webhook signature' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Req() request: RawBodyRequest<FastifyRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = request.rawBody?.toString() || '';
    const event = await this.stripeService.constructWebhookEvent(payload, signature);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
      // Add other webhook event handlers as needed
    }

    return { received: true };
  }
}

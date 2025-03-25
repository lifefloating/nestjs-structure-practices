import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Amount in smallest currency unit (e.g., cents for USD)',
    example: 2000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  readonly amount: number;

  @ApiProperty({
    description: 'Three-letter ISO currency code',
    example: 'usd',
  })
  @IsNotEmpty()
  @IsString()
  readonly currency: string;

  @ApiPropertyOptional({
    description: 'Description of the payment intent',
    example: 'Payment for order #1234',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Set of key-value pairs for additional information',
    example: { orderId: '1234' },
  })
  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, string>;
}

import { IsNotEmpty, IsString, IsEmail, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiPropertyOptional({
    description: 'Customer name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Set of key-value pairs for additional information',
    example: { userId: '1234' },
  })
  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, string>;
}

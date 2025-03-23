import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsEmail(
    {},
    {
      message: 'validate.email.invalid',
    },
  )
  @IsNotEmpty({
    message: 'validate.email.required',
  })
  readonly email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: i18nValidationMessage('validate.password.minLength', {
      minLength: 8,
    }),
  })
  readonly password: string;

  @ApiPropertyOptional({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  readonly firstName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  readonly lastName?: string;
}

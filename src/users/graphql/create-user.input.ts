import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsEmail({}, { message: 'validate.email.invalid' })
  @IsNotEmpty({ message: 'validate.email.required' })
  email: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;
}

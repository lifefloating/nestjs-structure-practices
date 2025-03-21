import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FileUploadResultDto {
  @ApiProperty({ description: 'File unique identifier' })
  key: string;

  @ApiProperty({ description: 'File access URL' })
  url: string;

  @ApiPropertyOptional({ description: 'File ETag value' })
  etag?: string;

  @ApiProperty({ description: 'File size (bytes)' })
  size: number;

  @ApiProperty({ description: 'File MIME type' })
  mimetype: string;

  @ApiProperty({ description: 'Original filename' })
  originalname: string;
}

export class FileUploadOptionsDto {
  @ApiPropertyOptional({ description: 'File access control list setting' })
  @IsString()
  @IsOptional()
  readonly acl?: string;

  @ApiPropertyOptional({ description: 'Custom metadata for the file' })
  @IsOptional()
  readonly metadata?: Record<string, string>;
}

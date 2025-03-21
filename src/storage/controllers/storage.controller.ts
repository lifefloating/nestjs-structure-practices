import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StorageService } from '../services/storage.service';
import { FileUploadResultDto } from '../dto/file-upload.dto';
import { FastifyRequest } from 'fastify';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
      },
    },
  })
  async uploadFile(@Req() req: FastifyRequest): Promise<FileUploadResultDto> {
    // Handle raw multipart upload using Fastify's built-in multipart support
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    try {
      const data = await req.file();

      if (!data) {
        throw new BadRequestException('No file uploaded');
      }

      this.logger.log(`Uploading file: ${data.filename}`);

      // Handle multipart file upload
      return this.storageService.uploadMultipartFile({
        filename: data.filename,
        mimetype: data.mimetype,
        file: data.file,
        size: data.file.bytesRead,
      });
    } catch (error) {
      this.logger.error('Error uploading file', error);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'key', description: 'Unique identifier of the file' })
  async deleteFile(@Param('key') key: string): Promise<{ success: boolean }> {
    this.logger.log(`Deleting file with key: ${key}`);
    const result = await this.storageService.deleteFile(key);
    return { success: result };
  }

  @Get(':key/url')
  @ApiOperation({ summary: 'Get a signed URL for a file' })
  @ApiParam({ name: 'key', description: 'Unique identifier of the file' })
  @ApiQuery({
    name: 'expiresIn',
    required: false,
    description: 'Expiration time for URL (seconds)',
    type: Number,
  })
  async getFileUrl(
    @Param('key') key: string,
    @Query('expiresIn') expiresIn?: number,
  ): Promise<{ url: string }> {
    this.logger.log(`Getting signed URL for file with key: ${key}`);
    const url = await this.storageService.getFileUrl(key, expiresIn);
    return { url };
  }
}

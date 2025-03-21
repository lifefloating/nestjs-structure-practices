import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { StorageProvider, UploadedFileResult } from '../providers/storage.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { pipeline } from 'stream';
import { v4 as uuidv4 } from 'uuid';

const pipelineAsync = util.promisify(pipeline);

@Injectable()
export class StorageService {
  private readonly storageProvider: StorageProvider;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    private readonly configService: ConfigService,
    @Inject('STORAGE_PROVIDERS') private readonly storageProviders: Record<string, StorageProvider>,
  ) {
    const storageConfig = this.configService.getStorageConfig();
    const providerType = storageConfig.provider;

    // 选择配置中指定的存储提供者
    if (this.storageProviders[providerType]) {
      this.storageProvider = this.storageProviders[providerType];
    } else {
      // 如果配置的提供者不可用，使用S3作为默认
      this.storageProvider = this.storageProviders['s3'];
    }

    this.maxFileSize = storageConfig.maxFileSize;
    this.allowedMimeTypes = storageConfig.allowedMimeTypes;
  }

  private validateFile(file: { mimetype: string; size: number }): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds the limit of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Check file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  async uploadFile(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): Promise<UploadedFileResult> {
    // Validate file
    this.validateFile(file);

    return this.storageProvider.uploadFile(file.buffer, file.originalname, {
      contentType: file.mimetype,
    });
  }

  async uploadMultipartFile(file: {
    filename: string;
    mimetype: string;
    file: any; // Fastify multipart file
    size: number;
  }): Promise<UploadedFileResult> {
    // Validate file
    this.validateFile(file);

    // Create temporary directory for storing uploaded files
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const tmpFilePath = path.join(tmpDir, `${uuidv4()}${path.extname(file.filename)}`);

    try {
      // Save the uploaded file stream to a temporary file
      const writeStream = fs.createWriteStream(tmpFilePath);
      await pipelineAsync(file.file, writeStream);

      // Read from temporary file, then upload to storage service
      const fileStream = fs.createReadStream(tmpFilePath);

      const result = await this.storageProvider.uploadFileFromStream(fileStream, file.filename, {
        contentType: file.mimetype,
      });

      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    } finally {
      // Clean up temporary files
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    return this.storageProvider.deleteFile(key);
  }

  async getFileUrl(key: string, expiresIn?: number): Promise<string> {
    return this.storageProvider.getFileUrl(key, expiresIn);
  }
}

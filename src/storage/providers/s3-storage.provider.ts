import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { StorageProvider, FileUploadOptions, UploadedFileResult } from './storage.interface';
import { ReadStream } from 'fs';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const storageConfig = this.configService.getStorageConfig();

    const s3Config: any = {
      region: storageConfig.region,
      credentials: {
        accessKeyId: storageConfig.accessKeyId,
        secretAccessKey: storageConfig.accessKeySecret,
      },
    };

    // If a custom endpoint is set, add it to the configuration
    if (storageConfig.endpoint) {
      s3Config.endpoint = storageConfig.endpoint;
      s3Config.forcePathStyle = true; // For MinIO or other S3-compatible services
    }

    this.s3Client = new S3Client(s3Config);
    this.bucket = storageConfig.bucket;
    this.baseUrl = storageConfig.baseUrl || '';
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    options: FileUploadOptions = {},
  ): Promise<UploadedFileResult> {
    const key = this.generateKey(filename);
    const contentType = options.contentType || 'application/octet-stream';

    const params: any = {
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: options.metadata,
      ACL: (options.acl as ObjectCannedACL) || 'private',
    };

    try {
      const command = new PutObjectCommand(params);
      const result = await this.s3Client.send(command);

      return {
        key,
        url: this.getPublicUrl(key),
        etag: result.ETag?.replace(/"/g, ''),
        size: fileBuffer.length,
        mimetype: contentType,
        originalname: filename,
      };
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async uploadFileFromStream(
    fileStream: ReadStream,
    filename: string,
    options: FileUploadOptions = {},
  ): Promise<UploadedFileResult> {
    const key = this.generateKey(filename);
    const contentType = options.contentType || 'application/octet-stream';

    const params: any = {
      Bucket: this.bucket,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
      Metadata: options.metadata,
      ACL: (options.acl as ObjectCannedACL) || 'private',
    };

    try {
      // Using multipart upload is better for handling large files
      const upload = new Upload({
        client: this.s3Client,
        params,
      });

      const result = await upload.done();

      // Because we're using streams, we can't determine file size, so return -1
      return {
        key,
        url: this.getPublicUrl(key),
        etag: result.ETag?.replace(/"/g, ''),
        size: -1, // Unable to directly get file size when uploading stream
        mimetype: contentType,
        originalname: filename,
      };
    } catch (error) {
      throw new Error(`Failed to upload file stream to S3: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  private getPublicUrl(key: string): string {
    if (this.baseUrl) {
      return `${this.baseUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.configService.getStorageConfig().region}.amazonaws.com/${key}`;
  }

  private generateKey(filename: string): string {
    const ext = path.extname(filename);
    const uuid = uuidv4();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}/${uuid}${ext}`;
  }
}

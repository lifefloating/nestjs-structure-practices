import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { StorageProvider, FileUploadOptions, UploadedFileResult } from './storage.interface';
import { ReadStream } from 'fs';
import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class AliOssStorageProvider implements StorageProvider {
  private readonly ossClient: OSS;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const storageConfig = this.configService.getStorageConfig();

    this.ossClient = new OSS({
      region: storageConfig.region,
      accessKeyId: storageConfig.accessKeyId,
      accessKeySecret: storageConfig.accessKeySecret,
      bucket: storageConfig.bucket,
      endpoint: storageConfig.endpoint,
    });

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

    try {
      // Upload file
      const headers: Record<string, string> = {};

      // Set ACL
      headers['x-oss-object-acl'] = options?.acl || 'private';

      // Set Content-Type
      headers['Content-Type'] = contentType;

      // Process metadata
      if (options?.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          headers[`x-oss-meta-${key}`] = String(value);
        });
      }

      const putOptions = {
        headers,
        timeout: 60000, // 60 seconds timeout
      } as any;

      const result = await this.ossClient.put(key, fileBuffer, putOptions);

      // Extract etag information
      let etag: string | undefined;
      try {
        if (
          result.res &&
          typeof result.res === 'object' &&
          result.res.headers &&
          typeof result.res.headers === 'object' &&
          'etag' in result.res.headers
        ) {
          etag = String(result.res.headers.etag).replace(/"/g, '');
        }
      } catch {
        // Ignore etag extraction errors
      }

      return {
        key,
        url: this.getPublicUrl(key),
        etag,
        size: fileBuffer.length,
        mimetype: contentType,
        originalname: filename,
      };
    } catch (error) {
      throw new Error(`Failed to upload file to Ali OSS: ${error.message}`);
    }
  }

  async uploadFileFromStream(
    fileStream: ReadStream,
    filename: string,
    options: FileUploadOptions = {},
  ): Promise<UploadedFileResult> {
    const key = this.generateKey(filename);
    const contentType = options.contentType || 'application/octet-stream';

    try {
      // Upload file stream
      const headers: Record<string, string> = {};

      // Set ACL
      headers['x-oss-object-acl'] = options?.acl || 'private';

      // Set Content-Type
      headers['Content-Type'] = contentType;

      // Process metadata
      if (options?.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          headers[`x-oss-meta-${key}`] = String(value);
        });
      }

      const putOptions = {
        headers,
        timeout: 60000, // 60 seconds timeout
      } as any;

      const result = await this.ossClient.putStream(key, fileStream, putOptions);

      // Extract etag information
      let etag: string | undefined;
      try {
        if (
          result.res &&
          typeof result.res === 'object' &&
          result.res.headers &&
          typeof result.res.headers === 'object' &&
          'etag' in result.res.headers
        ) {
          etag = String(result.res.headers.etag).replace(/"/g, '');
        }
      } catch {
        // Ignore etag extraction errors
      }

      return {
        key,
        url: this.getPublicUrl(key),
        etag,
        size: -1, // Unable to directly get file size when uploading stream
        mimetype: contentType,
        originalname: filename,
      };
    } catch (error) {
      throw new Error(`Failed to upload file stream to Ali OSS: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.ossClient.delete(key);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file from Ali OSS: ${error.message}`);
    }
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      // Alibaba Cloud OSS generates URLs with signature information, suitable for private buckets
      const signedUrl = this.ossClient.signatureUrl(key, {
        expires: expiresIn,
      });

      return await Promise.resolve(signedUrl);
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  private getPublicUrl(key: string): string {
    if (this.baseUrl) {
      return `${this.baseUrl}/${key}`;
    }

    // If baseUrl is not set, use Alibaba Cloud OSS default URL format
    const storage = this.configService.getStorageConfig();
    const endpoint = storage.endpoint || `oss-${storage.region}.aliyuncs.com`;
    return `https://${this.bucket}.${endpoint}/${key}`;
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

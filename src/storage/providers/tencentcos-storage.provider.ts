import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { StorageProvider, FileUploadOptions, UploadedFileResult } from './storage.interface';
import { ReadStream } from 'fs';
import * as COS from 'cos-nodejs-sdk-v5';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

// Tencent Cloud COS ACL types
type TencentACL = 'private' | 'public-read' | 'public-read-write';

@Injectable()
export class TencentCosStorageProvider implements StorageProvider {
  private readonly cosClient: COS;
  private readonly bucket: string;
  private readonly region: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    const storageConfig = this.configService.getStorageConfig();

    this.cosClient = new COS({
      SecretId: storageConfig.accessKeyId,
      SecretKey: storageConfig.accessKeySecret,
    });

    this.region = storageConfig.region ?? '';
    this.bucket = storageConfig.bucket;
    this.baseUrl = storageConfig.baseUrl ?? '';
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    options: FileUploadOptions = {},
  ): Promise<UploadedFileResult> {
    const key = this.generateKey(filename);
    const contentType = options.contentType || 'application/octet-stream';

    return new Promise((resolve, reject) => {
      // Tencent Cloud COS SDK uses callback approach
      this.cosClient.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
          // Due to type issues, use any type directly
        } as any,
        (err, data) => {
          if (err) {
            reject(new Error(`Failed to upload file to Tencent COS: ${err.message}`));
            return;
          }

          resolve({
            key,
            url: this.getPublicUrl(key),
            etag: data.ETag?.replace(/"/g, ''),
            size: fileBuffer.length,
            mimetype: contentType,
            originalname: filename,
          });
        },
      );
    });
  }

  async uploadFileFromStream(
    fileStream: ReadStream,
    filename: string,
    options: FileUploadOptions = {},
  ): Promise<UploadedFileResult> {
    const key = this.generateKey(filename);
    const contentType = options.contentType || 'application/octet-stream';

    return new Promise((resolve, reject) => {
      // Tencent Cloud COS SDK uses callback approach
      this.cosClient.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: fileStream,
          ContentType: contentType,
          // Due to type issues, use any type directly
        } as any,
        (err, data) => {
          if (err) {
            reject(new Error(`Failed to upload file stream to Tencent COS: ${err.message}`));
            return;
          }

          resolve({
            key,
            url: this.getPublicUrl(key),
            etag: data.ETag?.replace(/"/g, ''),
            size: -1, // Unable to directly get file size when uploading stream
            mimetype: contentType,
            originalname: filename,
          });
        },
      );
    });
  }

  async deleteFile(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.cosClient.deleteObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
        },
        (err) => {
          if (err) {
            reject(new Error(`Failed to delete file from Tencent COS: ${err.message}`));
            return;
          }

          resolve(true);
        },
      );
    });
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Use signed URL to access files in private buckets
        this.cosClient.getObjectUrl(
          {
            Bucket: this.bucket,
            Region: this.region,
            Key: key,
            Expires: expiresIn,
            Sign: true,
          },
          (err, data) => {
            if (err) {
              reject(new Error(`Failed to generate signed URL: ${err.message}`));
              return;
            }

            resolve(data.Url);
          },
        );
      } catch (error) {
        reject(new Error(`Failed to generate signed URL: ${error.message}`));
      }
    });
  }

  private getPublicUrl(key: string): string {
    if (this.baseUrl) {
      return `${this.baseUrl}/${key}`;
    }

    // Tencent Cloud COS default URL format
    return `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
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

  // Map common ACL to Tencent Cloud ACL
  private mapToTencentACL(acl: string): TencentACL {
    switch (acl) {
      case 'public-read':
        return 'public-read';
      case 'public-read-write':
        return 'public-read-write';
      case 'private':
      default:
        return 'private';
    }
  }
}

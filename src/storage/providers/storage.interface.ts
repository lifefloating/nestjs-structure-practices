import { ReadStream } from 'fs';

export interface FileUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: string;
}

export interface UploadedFileResult {
  key: string;
  url: string;
  etag?: string;
  size: number;
  mimetype: string;
  originalname: string;
}

export interface StorageProvider {
  /**
   * Upload file
   * @param fileBuffer - File buffer
   * @param filename - Filename
   * @param options - Upload options
   */
  uploadFile(
    fileBuffer: Buffer,
    filename: string,
    options?: FileUploadOptions,
  ): Promise<UploadedFileResult>;

  /**
   * Upload file from stream
   * @param fileStream - File stream
   * @param filename - Filename
   * @param options - Upload options
   */
  uploadFileFromStream(
    fileStream: ReadStream,
    filename: string,
    options?: FileUploadOptions,
  ): Promise<UploadedFileResult>;

  /**
   * Delete file
   * @param key - Unique file identifier
   */
  deleteFile(key: string): Promise<boolean>;

  /**
   * Get file URL
   * @param key - Unique file identifier
   * @param expiresIn - URL expiration time (seconds)
   */
  getFileUrl(key: string, expiresIn?: number): Promise<string>;
}

# 📂 Cloud Storage Service Integration Guide

This project supports three mainstream cloud storage services: Alibaba Cloud OSS, Tencent Cloud COS, and Amazon S3, providing file upload, download, and management functions through a unified interface.

## 🔑 Configuration Parameters

Configure the following environment variables in the project's `.env` file:

```bash
# Storage Basic Configuration
STORAGE_PROVIDER=alioss  # Available options: alioss, tencentoss, s3
STORAGE_BUCKET=your-bucket-name
STORAGE_REGION=your-region
STORAGE_ACCESS_KEY_ID=your-access-key-id
STORAGE_ACCESS_KEY_SECRET=your-access-key-secret
STORAGE_ENDPOINT=your-endpoint  # Optional, applicable to Alibaba Cloud OSS
STORAGE_BASE_URL=https://your-cdn-domain.com  # Optional, for custom access domain

# File Upload Limits
STORAGE_MAX_FILE_SIZE=10485760  # Maximum file size (10MB)
STORAGE_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

## Dynamic Provider Loading

To enhance system flexibility, the storage module uses a dynamic provider pattern that automatically loads the appropriate storage provider based on the `STORAGE_PROVIDER` configuration:

1. The system always loads the S3 storage provider as a backup option
2. Based on the value of `STORAGE_PROVIDER`, it dynamically loads the corresponding cloud storage provider (alioss/tencentoss)
3. Only when a provider is properly configured will it be initialized, avoiding startup errors due to missing configuration

For example, if configured as `STORAGE_PROVIDER=alioss`, the system will:
- Load S3StorageProvider as a backup
- Load AliOssStorageProvider as the primary provider
- Not load TencentCosStorageProvider

This design prevents dependency injection errors when a storage provider is not configured.

## 📋 Main Interfaces

### StorageService

`StorageService` is a unified service interface that provides the following methods:

| Method | Description | Parameters | Return Value |
|-----|------|------|-------|
| `uploadFile` | Upload buffer file | `fileBuffer: Buffer`<br>`filename: string`<br>`options?: FileUploadOptions` | `Promise<UploadedFileResult>` |
| `uploadFileFromStream` | Upload stream file | `fileStream: ReadStream`<br>`filename: string`<br>`options?: FileUploadOptions` | `Promise<UploadedFileResult>` |
| `deleteFile` | Delete file | `key: string` | `Promise<boolean>` |
| `getFileUrl` | Get file access URL | `key: string`<br>`expiresIn?: number` | `Promise<string>` |

### FileUploadOptions

Options object for file upload:

```typescript
interface FileUploadOptions {
  contentType?: string;              // File MIME type
  metadata?: Record<string, string>; // Custom metadata
  acl?: string;                      // Access control, default is 'private'
}
```

### UploadedFileResult

Result object for file upload:

```typescript
interface UploadedFileResult {
  key: string;          // File unique identifier
  url: string;          // File access URL
  etag?: string;        // File ETag identifier
  size: number;         // File size (bytes)
  mimetype: string;     // File MIME type
  originalname: string; // Original filename
}
```

## 🛠️ Usage Examples

### Basic File Upload

```typescript
@Injectable()
export class FileService {
  constructor(private readonly storageService: StorageService) {}

  async uploadFile(fileBuffer: Buffer, filename: string): Promise<string> {
    const result = await this.storageService.uploadFile(fileBuffer, filename);
    return result.url;
  }
}
```

### Upload with Metadata and Access Control

```typescript
async uploadFileWithMetadata(fileBuffer: Buffer, filename: string, userId: string): Promise<string> {
  const options = {
    contentType: 'image/jpeg',
    metadata: {
      userId: userId,
      uploadTime: new Date().toISOString()
    },
    acl: 'private'  // 'private' (default), 'public-read', 'public-read-write'
  };

  const result = await this.storageService.uploadFile(fileBuffer, filename, options);
  return result.key;
}
```

### Get Signed Temporary URL

```typescript
async getFileSignedUrl(fileKey: string): Promise<string> {
  // Generate a signed URL valid for 1 hour
  return this.storageService.getFileUrl(fileKey, 3600);
}
```

### Delete File

```typescript
async deleteFile(fileKey: string): Promise<boolean> {
  return await this.storageService.deleteFile(fileKey);
}
```

## 🌐 Supported Cloud Storage Services

### Alibaba Cloud OSS ![AliOSS](https://img.shields.io/badge/Aliyun-OSS-FF6A00?style=flat-square&logo=alibabacloud&logoColor=white)

Alibaba Cloud Object Storage Service (OSS) is a massive, secure, low-cost, and highly reliable cloud storage service provided by Alibaba Cloud.

**Reference Documentation**:
- [Alibaba Cloud OSS Official Documentation](https://help.aliyun.com/product/31815.html)
- [Node.js SDK Documentation](https://help.aliyun.com/document_detail/32067.html)

### Tencent Cloud COS ![TencentCOS](https://img.shields.io/badge/Tencent-COS-3399FF?style=flat-square&logo=tencentqq&logoColor=white)

Tencent Cloud Object Storage (COS) is a distributed storage service for storing massive files provided by Tencent Cloud.

**Reference Documentation**:
- [Tencent Cloud COS Official Documentation](https://cloud.tencent.com/document/product/436)
- [Node.js SDK Documentation](https://cloud.tencent.com/document/product/436/8629)

### Amazon S3 ![AmazonS3](https://img.shields.io/badge/Amazon-S3-FF9900?style=flat-square&logo=amazons3&logoColor=white)

Amazon Simple Storage Service (S3) is an industry-leading object storage service that provides industry-leading scalability, data availability, security, and performance.

**Reference Documentation**:
- [Amazon S3 Official Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)

## ⚠️ Security Tips

1. **Never** hardcode access keys directly in your code
2. By default, all files are set to private access permissions
3. For sensitive data, server-side encryption is recommended
4. Rotate access keys regularly
5. Enable access logs and monitoring

## 📁 File Structure

Files are organized by date after upload, in the format: `YYYY/MM/DD/uuid.extension`
For example: `2023/05/12/f8e7d6c5-b4a3-12d1-e9f8-7g6h5j4k3l2m.jpg` 
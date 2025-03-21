# 📂 云存储服务集成指南

本项目支持三种主流云存储服务：阿里云OSS、腾讯云COS和Amazon S3，通过统一的接口提供文件上传、下载和管理功能。

## 🔑 配置参数

在项目的`.env`文件中配置以下环境变量：

```bash
# 存储基本配置
STORAGE_PROVIDER=alioss  # 可选值: alioss, tencentoss, s3
STORAGE_BUCKET=your-bucket-name
STORAGE_REGION=your-region
STORAGE_ACCESS_KEY_ID=your-access-key-id
STORAGE_ACCESS_KEY_SECRET=your-access-key-secret
STORAGE_ENDPOINT=your-endpoint  # 可选，适用于阿里云OSS
STORAGE_BASE_URL=https://your-cdn-domain.com  # 可选，用于自定义访问域名

# 文件上传限制
STORAGE_MAX_FILE_SIZE=10485760  # 最大文件大小 (10MB)
STORAGE_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,application/pdf
```
## 动态provider加载

为了提高系统的灵活性，存储模块使用了动态提供者模式，根据配置中的 `STORAGE_PROVIDER` 设置自动加载相应的存储提供者：

1. 系统默认始终加载 S3 存储提供者作为后备选项
2. 根据 `STORAGE_PROVIDER` 的值动态加载相应的云存储提供者(alioss/tencentoss)
3. 仅当配置了相应提供者时，才会初始化该提供者，避免因缺少配置导致的启动错误

例如，如果配置为 `STORAGE_PROVIDER=alioss`，系统将：
- 加载 S3StorageProvider 作为后备
- 加载 AliOssStorageProvider 作为主要提供者
- 不加载 TencentCosStorageProvider 

这种设计可以避免在未配置某个存储提供者时出现依赖注入错误。

## 📋 主要接口

### StorageService

`StorageService` 是统一的服务接口，提供以下方法：

| 方法 | 描述 | 参数 | 返回值 |
|-----|------|------|-------|
| `uploadFile` | 上传Buffer文件 | `fileBuffer: Buffer`<br>`filename: string`<br>`options?: FileUploadOptions` | `Promise<UploadedFileResult>` |
| `uploadFileFromStream` | 上传流文件 | `fileStream: ReadStream`<br>`filename: string`<br>`options?: FileUploadOptions` | `Promise<UploadedFileResult>` |
| `deleteFile` | 删除文件 | `key: string` | `Promise<boolean>` |
| `getFileUrl` | 获取文件访问URL | `key: string`<br>`expiresIn?: number` | `Promise<string>` |

### FileUploadOptions

上传文件的选项对象：

```typescript
interface FileUploadOptions {
  contentType?: string;              // File MIME type
  metadata?: Record<string, string>; // Custom metadata
  acl?: string;                      // Access control, default is 'private'
}
```

### UploadedFileResult

上传文件的结果对象：

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

## 🛠️ 使用示例

### 基本文件上传

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

### 带元数据和访问控制的上传

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

### 获取带签名的临时URL

```typescript
async getFileSignedUrl(fileKey: string): Promise<string> {
  // Generate a signed URL valid for 1 hour
  return this.storageService.getFileUrl(fileKey, 3600);
}
```

### 删除文件

```typescript
async deleteFile(fileKey: string): Promise<boolean> {
  return await this.storageService.deleteFile(fileKey);
}
```

## 🌐 支持的云存储服务

### 阿里云OSS ![AliOSS](https://img.shields.io/badge/Aliyun-OSS-FF6A00?style=flat-square&logo=alibabacloud&logoColor=white)

阿里云对象存储服务（Object Storage Service）是阿里云提供的海量、安全、低成本、高可靠的云存储服务。

**参考文档**：
- [阿里云OSS官方文档](https://help.aliyun.com/product/31815.html)
- [Node.js SDK文档](https://help.aliyun.com/document_detail/32067.html)

### 腾讯云COS ![TencentCOS](https://img.shields.io/badge/Tencent-COS-3399FF?style=flat-square&logo=tencentqq&logoColor=white)

腾讯云对象存储（Cloud Object Storage）是腾讯云提供的一种存储海量文件的分布式存储服务。

**参考文档**：
- [腾讯云COS官方文档](https://cloud.tencent.com/document/product/436)
- [Node.js SDK文档](https://cloud.tencent.com/document/product/436/8629)

### Amazon S3 ![AmazonS3](https://img.shields.io/badge/Amazon-S3-FF9900?style=flat-square&logo=amazons3&logoColor=white)

Amazon Simple Storage Service (S3) 是业界领先的对象存储服务，提供行业领先的可扩展性、数据可用性、安全性和性能。

**参考文档**：
- [Amazon S3官方文档](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript文档](https://docs.aws.amazon.com/sdk-for-javascript/)

## ⚠️ 安全提示

1. **永远不要**直接在代码中硬编码访问密钥
2. 默认情况下，所有文件设置为私有访问权限
3. 对于敏感数据，建议使用服务端加密
4. 定期轮换访问密钥
5. 启用访问日志和监控

## 📁 文件结构

文件上传后按日期组织，格式为：`YYYY/MM/DD/uuid.extension`
例如：`2023/05/12/f8e7d6c5-b4a3-12d1-e9f8-7g6h5j4k3l2m.jpg` 
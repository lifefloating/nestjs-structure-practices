export interface AppConfig {
  name: string;
  description: string;
  version: string;
  port: number;
  host: string;
  apiPrefix: string;
}

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
}

export interface CorsConfig {
  enabled: boolean;
  origin: string | string[];
  credentials: boolean;
  methods: string[];
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export interface SecurityConfig {
  helmet: boolean;
  rateLimit:
    | boolean
    | {
        ttl: number;
        limit: number;
      };
}

export interface DatabaseConfig {
  url: string;
}

export interface StorageConfig {
  provider: 's3' | 'alioss' | 'tencentoss';
  bucket: string;
  region?: string;
  endpoint?: string;
  accessKeyId: string;
  accessKeySecret: string;
  baseUrl?: string;
  maxFileSize: number; // use bytes
  allowedMimeTypes: string[];
}

export interface DatdogConfig {
  apiKey: string;
  hostName?: string;
  serviceName?: string;
  intakeRegion: string;
}
export interface Config {
  app: AppConfig;
  auth: AuthConfig;
  cors: CorsConfig;
  swagger: SwaggerConfig;
  security: SecurityConfig;
  database: DatabaseConfig;
  storage: StorageConfig;
  datadog: DatdogConfig;
}

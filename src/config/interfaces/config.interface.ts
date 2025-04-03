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
  openApiVersion: string;
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

export interface StripeConfig {
  secretKey: string;
  publicKey: string;
  webhookSecret: string;
  apiVersion: string;
}

export interface DatdogConfig {
  apiKey: string;
  hostName?: string;
  serviceName?: string;
  intakeRegion: string;
}

export interface OAuthConfig {
  providers: Array<{
    type: string;
    enabled: boolean;
  }>;
  baseConfig: {
    callbackUrl: string;
    cookieName: string;
    cookieMaxAge: number;
    cookieSecure: boolean;
  };
  secrets: Record<string, Record<string, string>>;
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
  stripe: StripeConfig;
  oauth: OAuthConfig;
}

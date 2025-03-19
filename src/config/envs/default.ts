export default {
  app: {
    name: process.env.APP_NAME || 'NestJS Structure Practices',
    description: process.env.APP_DESCRIPTION || 'NestJS template with best practices',
    version: process.env.API_VERSION || '1.0',
    port: parseInt(process.env.PORT || '3009', 10),
    host: process.env.HOST || 'localhost',
    apiPrefix: process.env.API_PREFIX || 'api',
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '90d',
    },
  },
  cors: {
    enabled: true,
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  },
  swagger: {
    enabled: true,
    title: 'NestJS API',
    description: 'NestJS API documentation',
    version: '1.0',
    path: 'docs',
  },
  security: {
    helmet: true,
    rateLimit: true,
  },
};

export default {
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/nestjs_practice',
  },
  swagger: {
    enabled: true,
  },
  app: {
    host: 'localhost',
  },
};

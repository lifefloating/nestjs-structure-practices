export default {
  database: {
    url: process.env.DATABASE_URL,
  },
  swagger: {
    enabled: false,
  },
  cors: {
    origin: ['https://your-production-domain.com'],
  },
  security: {
    rateLimit: {
      ttl: 60,
      limit: 30,
    },
  },
};

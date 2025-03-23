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
  datadog: {
    apiKey: '9be428581055d6d3a7f9f450149d64f6',
    serviceName: process.env.DATADOG_SERVICE_NAME || 'my-service',
    hostName: process.env.DATADOG_HOST_NAME || 'host-name',
    intakeRegion: process.env.DATADOG_INTAKE_REGION || 'us5',
  },
};

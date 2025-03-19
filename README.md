# Nest JS Project Template

<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A modern NestJS project structure with best practices using Fastify, Prisma, MongoDB, and SWC.</p>

<p align="center">
  <a href="https://github.com/nestjs/nest" target="_blank"><img src="https://img.shields.io/github/license/nestjs/nest.svg" alt="Package License" /></a>
  <a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/node-%3E%3D%2020.0.0-green.svg" alt="Node Version" /></a>
  <a href="https://pnpm.io/" target="_blank"><img src="https://img.shields.io/badge/pnpm-%3E%3D%208.0.0-blue.svg" alt="Pnpm Version" /></a>
  <a href="https://www.mongodb.com/" target="_blank"><img src="https://img.shields.io/badge/database-MongoDB-green.svg" alt="Database" /></a>
</p>

## 📋 Tech Stack

- **Framework**: [NestJS 10.x](https://nestjs.com/) with [Fastify](https://www.fastify.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Prisma ORM](https://www.prisma.io/)
- **Compiler**: [SWC](https://swc.rs/) for TypeScript
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Authentication**: JWT with [Passport](https://www.passportjs.org/)
- **Documentation**: [Swagger/OpenAPI](https://swagger.io/)
- **Validation**: [class-validator](https://github.com/typestack/class-validator) with DTOs
- **Logging**: [Pino](https://getpino.io/) for structured logging
- **Testing**: [Jest](https://jestjs.io/)
- **Linting**: [ESLint](https://eslint.org/) with TypeScript rules (inspired by [brocoders/nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate))

## Features

- Modular architecture with proper separation of concerns
- Global exception handling and request/response transformation
- Database integration with Prisma ORM
- Structured logging
- API documentation with Swagger
- Configuration management with validation
- Authentication and authorization
- Unit and e2e testing setup
- Performance optimized with Fastify and SWC

## Project Structure

```
├── prisma/                 # Prisma ORM schema and migrations
├── src/
│   ├── config/             # Environment configuration
│   │   ├── envs/           # Environment-specific configs
│   │   └── interfaces/     # Configuration interfaces
│   ├── common/             # Global Nest modules
│   │   ├── constants/      # Constant values and enums
│   │   ├── controllers/    # Common controllers
│   │   ├── decorators/     # Custom decorators
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── filters/        # Exception filters
│   │   ├── guards/         # Route guards
│   │   ├── interceptors/   # Request/response interceptors
│   │   ├── interfaces/     # TypeScript interfaces
│   │   ├── middleware/     # HTTP middleware
│   │   ├── pipes/          # Validation pipes
│   │   └── providers/      # Common providers
│   ├── core/               # Core modules (auth, database, etc.)
│   ├── modules/            # Feature modules
│   │   └── users/          # Example feature module
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── dto/
│   │       └── entities/
│   ├── prisma/             # Prisma service
│   ├── shared/             # Shared modules
│   ├── app.module.ts       # Root application module
│   └── main.ts             # Application entry point
└── test/                   # End-to-end tests
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [pnpm](https://pnpm.io/) v8 or higher
- [MongoDB](https://www.mongodb.com/) server

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.sample .env
# Edit .env with your configuration
```

4. Generate Prisma client:

```bash
pnpm prisma:generate
```

5. Seed the database (optional):

```bash
pnpm db:seed
```

### Running the Application

Development mode:

```bash
pnpm start:dev
```

Production mode:

```bash
pnpm build
pnpm start:prod
```

### 🧹 Code Quality

Linting code:

```bash
# Check for ESLint errors
pnpm lint:check

# Fix ESLint errors automatically
pnpm lint
```

> **Note:** ESLint configuration is inspired by [brocoders/nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate)

Formatting code:

```bash
pnpm format
```

### Testing

Running unit tests:

```bash
pnpm test
```

Running e2e tests:

```bash
pnpm test:e2e
```

## API Documentation

API documentation is available at `/docs` when the application is running. It provides an interactive interface to explore and test the API endpoints.

## License

[MIT](LICENSE)

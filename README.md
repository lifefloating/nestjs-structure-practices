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

## Documentation

- [Installation and Running Guide](./docs/install&run.md)
- [Commit Convention](./COMMIT_CONVENTION.md)

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
- Git hooks with Husky and [conventional commits](./COMMIT_CONVENTION.md)

## Getting Started

For installation and running instructions, please see the [Installation and Running Guide](./docs/install&run.md).

## develop plan

- [plan](https://github.com/lifefloating/nestjs-project-template/discussions/11)

## License

[MIT](LICENSE)

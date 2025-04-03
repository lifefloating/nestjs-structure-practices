# Nest JS Project Template

<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A modern NestJS project structure with best practices using Fastify, Prisma, MongoDB, and SWC. and more</p>

<p align="center">
  <a href="https://github.com/nestjs/nest" target="_blank"><img src="https://img.shields.io/github/license/nestjs/nest.svg" alt="Package License" /></a>
  <a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/node-%3E%3D%2020.0.0-green.svg" alt="Node Version" /></a>
  <a href="https://pnpm.io/" target="_blank"><img src="https://img.shields.io/badge/pnpm-%3E%3D%208.0.0-blue.svg" alt="Pnpm Version" /></a>
  <a href="https://www.mongodb.com/" target="_blank"><img src="https://img.shields.io/badge/database-MongoDB-green.svg" alt="Database" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Aliyun-OSS-FF6A00?style=flat-square&logo=alibabacloud&logoColor=white" alt="Aliyun OSS" />
  <img src="https://img.shields.io/badge/Tencent-COS-3399FF?style=flat-square&logo=tencentqq&logoColor=white" alt="Tencent COS" />
  <img src="https://img.shields.io/badge/Amazon-S3-FF9900?style=flat-square&logo=amazons3&logoColor=white" alt="Amazon S3" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Better--Auth-6366F1?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIxMSIgd2lkdGg9IjE4IiBoZWlnaHQ9IjExIiByeD0iMiIgcnk9IjIiPjwvcmVjdD48cGF0aCBkPSJNNyA5VjdhNiA2IDAgMCAxIDEyIDBWOSI+PC9wYXRoPjwvc3ZnPg==&logoColor=white" alt="Better Auth" />
  <img src="https://img.shields.io/badge/Pino-Logger-11C877?style=flat-square&logo=pino&logoColor=white" alt="Pino" />
  <img src="https://img.shields.io/badge/MJML-Email-EB5757?style=flat-square&logo=mail.ru&logoColor=white" alt="MJML" />
  <img src="https://img.shields.io/badge/Docker-Containers-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Stripe-Payments-008CDD?style=flat-square&logo=stripe&logoColor=white" alt="Stripe" />
</p>

## Documentation

- [Installation and Running Guide](./docs/install&run.md)
- [Cloud Storage Integration Guide (Chinese)](./docs/storage-guide.md) | [English](./docs/storage-guide-en.md)
- [OAuth Authentication Guide (Chinese)](./docs/oauth-guide.md) | [English](./docs/oauth-guide-en.md)

## commit Doc

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
- **Storage**: Multi-cloud storage support ([Alibaba Cloud OSS](https://www.alibabacloud.com/product/object-storage-service), [Tencent Cloud COS](https://www.tencentcloud.com/products/cos), [Amazon S3](https://aws.amazon.com/s3/))

## Features

- Modular architecture with proper separation of concerns
- Global exception handling and request/response transformation
- Database integration with Prisma ORM
- Structured logging
- API documentation with Swagger
- Configuration management with validation
- Authentication and authorization with multiple OAuth providers (Google, GitHub, Facebook, Twitter, Microsoft, Discord, Apple)
- Unit and e2e testing setup
- Performance optimized with Fastify and SWC
- Git hooks with Husky and [conventional commits](./COMMIT_CONVENTION.md)
- Unified cloud storage interface with multiple provider support

## Getting Started

For installation and running instructions, please see the [Installation and Running Guide](./docs/install&run.md).

## develop plan

- [plan](https://github.com/lifefloating/nestjs-project-template/discussions/11)

## License

[MIT](LICENSE)

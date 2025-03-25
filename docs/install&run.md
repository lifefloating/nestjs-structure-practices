# Installation and Running Guide

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [pnpm](https://pnpm.io/) v8 or higher
- [MongoDB](https://www.mongodb.com/) server

## Installation

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

## Running the Application

Development mode:

```bash
pnpm start:dev
```

Production mode:

```bash
pnpm build
pnpm start:prod
```

## Code Quality

### Linting code:

```bash
# Check for ESLint errors
pnpm lint:check

# Fix ESLint errors automatically
pnpm lint
```

> **Note:** ESLint configuration is inspired by [brocoders/nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate)

### Formatting code:

```bash
pnpm format
```

## Testing

Running unit tests:

```bash
pnpm test
```

Running e2e tests:

```bash
pnpm test:e2e
```

## API Documentation

API documentation is available at `/apidoc` when the application is running. It provides an interactive interface to explore and test the API endpoints.

http://localhost:7009/apidoc#/
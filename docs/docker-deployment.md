# Docker Deployment Guide

This guide provides instructions for deploying the NestJS application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0.0 or higher)

## Docker Configuration Files

The project includes the following Docker configuration files:

- `Dockerfile`: Defines the multi-stage build process for the application container
- `docker-compose.yml`: Configuration for running both the application and MongoDB in production
- `docker-compose.dev.yml`: Configuration for running only MongoDB for local development
- `.dockerignore`: Specifies which files should be excluded from the Docker build

## Development Environment

### Running MongoDB in Docker (Local Development)

If you want to run MongoDB in Docker while developing the application locally:

```bash
# Start MongoDB container
docker compose -f docker-compose.dev.yml up -d

# Check container status
docker ps

# View MongoDB logs
docker compose -f docker-compose.dev.yml logs -f
```

With MongoDB running in Docker, update your `.env` file to connect to it:

```
DATABASE_URL=mongodb://localhost:27017/nestjs_practice
```

You can then run the NestJS application locally:

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Start the application in development mode
pnpm start:dev
```

### Stopping the Development Environment

```bash
# Stop and remove MongoDB container
docker compose -f docker-compose.dev.yml down

# To remove volumes as well (will delete all data)
docker compose -f docker-compose.dev.yml down -v
```

## Production Deployment

### Building the Docker Image

```bash
# Build the Docker image
docker build -t nestjs-app .
```

### Running with Docker Compose

```bash
# Start the application and MongoDB
docker compose up -d

# Check container status
docker ps

# View application logs
docker compose logs -f app

# View MongoDB logs
docker compose logs -f mongodb
```

### Environment Variables

When deploying with Docker, the database connection string should be:

```
DATABASE_URL=mongodb://mongodb:27017/nestjs_practice
```

Other environment variables can be set in `.env` file or configured in the `docker-compose.yml` file.

### Accessing the Application

The application will be available at http://localhost:7009.

### Stopping the Application

```bash
# Stop and remove containers
docker compose down

# Stop and remove containers and volumes (will delete all data)
docker compose down -v
```

## Container Management

### Viewing Logs

```bash
# View application logs
docker logs -f nestjs-app

# View MongoDB logs
docker logs -f mongodb
```

### Entering Containers

```bash
# Access the application container shell
docker exec -it nestjs-app sh

# Access the MongoDB shell
docker exec -it mongodb mongosh
```

### Checking Container Health

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' nestjs-app
```

## Data Management

### MongoDB Data Persistence

MongoDB data is stored in a Docker volume named `mongodb-data`. This ensures that your data persists even if the container is removed.

### Backup and Restore

```bash
# Backup MongoDB data
docker exec -it mongodb sh -c 'mongodump --archive' > mongodb-backup.archive

# Restore MongoDB data
docker exec -it mongodb sh -c 'mongorestore --archive' < mongodb-backup.archive
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: If port 7009 or 27017 is already in use, you can change the port mapping in the `docker-compose.yml` file.

2. **Connection issues**: If the application cannot connect to MongoDB, ensure the `DATABASE_URL` is set correctly to `mongodb://mongodb:27017/nestjs_practice` in the application container.

3. **Permission issues**: If you encounter permission errors with volumes, you might need to run Docker commands with sudo or adjust the file permissions.

### Viewing Container Logs for Debugging

```bash
# View detailed container logs
docker logs -f nestjs-app
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Image Documentation](https://hub.docker.com/_/mongo) 
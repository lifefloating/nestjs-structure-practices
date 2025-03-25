import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get('NODE_ENV') !== 'production';

        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
          sortSchema: true,
          playground: isDevelopment,
          introspection: isDevelopment,
          path: '/graphql',
          context: ({ req }: { req: Request }) => ({ req }),
          useGlobalFilters: false,
        };
      },
    }),
  ],
})
export class GraphQLAppModule {}

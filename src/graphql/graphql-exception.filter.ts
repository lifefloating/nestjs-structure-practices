import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): unknown {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();

    // logger error
    this.logger.error(
      `GraphQL Error: ${info.fieldName}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // if http exception
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const statusCode = exception.getStatus();

      return {
        message: typeof response === 'object' ? (response as any).message : response,
        statusCode,
      };
    }

    // for other errors, return directly, let GraphQL handle it
    return exception;
  }
}

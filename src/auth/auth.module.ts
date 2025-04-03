import { DynamicModule, MiddlewareConsumer, NestModule, Provider, Module } from '@nestjs/common';
import { AuthInstance } from './auth.interface';

import { AuthInstanceInjectKey } from './auth.constant';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { ConfigModule } from '@app/config/config.module';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({})
export class AuthModule implements NestModule {
  static forRoot(): DynamicModule {
    const authProvider: Provider = {
      provide: AuthInstanceInjectKey,
      useFactory: () => {
        let auth: AuthInstance;
        return {
          get() {
            return auth;
          },
          set(value: AuthInstance) {
            auth = value;
          },
        };
      },
    };

    return {
      module: AuthModule,
      imports: [ConfigModule, PrismaModule],
      providers: [AuthService, authProvider],
      controllers: [AuthController],
      exports: [AuthService, authProvider],
      global: true,
    };
  }

  configure(consumer: MiddlewareConsumer) {
    // Configure routes to match all possible auth path patterns
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        '*prefix/auth/*path',
        'auth/*path',
        'api/*prefix/auth/*path',
        '*prefix/*module/auth/*path',
        'api/*prefix/auth',
      );

    consumer.apply(AuthMiddleware).exclude();
  }
}

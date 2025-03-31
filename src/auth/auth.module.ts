import type { DynamicModule, MiddlewareConsumer, NestModule, Provider } from '@nestjs/common';
import type { AuthInstance } from './auth.interface';

import { AuthInstanceInjectKey } from './auth.constant';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { ConfigModule } from '@app/config/config.module';

export class AuthModule implements NestModule {
  static forRoot(): DynamicModule {
    let auth: AuthInstance;

    const authProvider: Provider = {
      provide: AuthInstanceInjectKey,
      useValue: {
        get() {
          return auth;
        },
        set(value: AuthInstance) {
          auth = value;
        },
      },
    };

    return {
      controllers: [AuthController],
      exports: [AuthService, authProvider],
      module: AuthModule,
      global: true,
      imports: [ConfigModule],
      providers: [AuthService, authProvider],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    const { API_VERSION, NODE_ENV } = process.env;
    const basePath = NODE_ENV === 'development' ? '/auth' : `/api/v${API_VERSION}/auth`;

    consumer.apply(AuthMiddleware).forRoutes(`${basePath}/*auth`);
  }
}

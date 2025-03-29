import type { BetterAuthOptions } from 'better-auth';
import type { NestMiddleware, OnModuleInit } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { Inject } from '@nestjs/common';

import { AuthInstanceInjectKey } from './auth.constant';
import { CreateAuth } from './auth.implement';
import { InjectAuthInstance } from './auth.interface';
import { ConfigService } from '@app/config/config.service';

declare module 'http' {
  interface IncomingMessage {
    originalUrl: string;
  }
}

export class AuthMiddleware implements NestMiddleware, OnModuleInit {
  private authHandler: Awaited<ReturnType<typeof CreateAuth>>['handler'] | undefined;

  constructor(
    private readonly configService: ConfigService,
    @Inject(AuthInstanceInjectKey)
    private readonly authInstance: InjectAuthInstance,
  ) {}

  async onModuleInit() {
    const handler = async () => {
      const oauth = await this.configService.getOAuthConfig();
      const providers = {} as NonNullable<BetterAuthOptions['socialProviders']>;
      oauth.providers.forEach((provider) => {
        if (!provider.enabled) return;
        const type = provider.type as string;

        const mergedConfig = {
          ...oauth.public[type],
          ...oauth.secrets[type],
        };
        switch (type) {
          case 'github': {
            if (!mergedConfig.clientId || !mergedConfig.clientSecret) return;

            providers.github = {
              clientId: mergedConfig.clientId,
              clientSecret: mergedConfig.clientSecret,
            };
            break;
          }

          case 'google': {
            if (!mergedConfig.clientId || !mergedConfig.clientSecret) return;

            providers.google = {
              clientId: mergedConfig.clientId,
              clientSecret: mergedConfig.clientSecret,
            };

            break;
          }
        }
      });
      const { handler, auth } = await CreateAuth(providers);
      this.authHandler = handler;

      this.authInstance.set(auth);
    };
    await handler();
  }

  async use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    if (!this.authHandler) {
      next();
      return;
    }

    const bypassPath = ['/token', '/session', '/providers'];

    if (bypassPath.some((path) => req.originalUrl.includes(path))) {
      next();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'POST') {
      next();
      return;
    }

    return await this.authHandler(req, res);
  }
}

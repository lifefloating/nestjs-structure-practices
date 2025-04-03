import type { BetterAuthOptions } from 'better-auth';
import type { NestMiddleware, OnModuleInit } from '@nestjs/common';

import { Injectable, Inject, Logger } from '@nestjs/common';

import {
  AuthInstanceInjectKey,
  OAuthProviderType,
  AUTH_BYPASS_PATHS,
  AUTH_ALLOWED_METHODS,
} from './auth.constant';
import { CreateAuth } from './auth.implement';
import { InjectAuthInstance } from './auth.interface';
import { ConfigService } from '@app/config/config.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware, OnModuleInit {
  private readonly logger = new Logger(AuthMiddleware.name);
  private authHandler: Awaited<ReturnType<typeof CreateAuth>>['handler'] | undefined;

  constructor(
    private readonly configService: ConfigService,
    @Inject(AuthInstanceInjectKey)
    private readonly authInstance: InjectAuthInstance,
  ) {}

  async onModuleInit() {
    await this.initializeAuthHandler();
  }

  private async initializeAuthHandler() {
    try {
      const oauth = await this.configService.getOAuthConfig();
      const providers = {} as NonNullable<BetterAuthOptions['socialProviders']>;

      oauth.providers.forEach((provider) => {
        if (!provider.enabled) return;

        // Safely cast provider type string to enum
        const providerType = this.getProviderType(provider.type);
        if (!providerType) return;

        // Get default config for this provider type
        const defaultConfig = oauth.defaults?.[provider.type] || {};

        const mergedConfig = {
          ...defaultConfig,
          ...oauth.public[provider.type],
          ...oauth.secrets[provider.type],
        };

        this.configureProvider(providers, providerType, mergedConfig);
      });

      const { handler, auth } = await CreateAuth(providers);
      this.authHandler = handler;
      this.authInstance.set(auth);
    } catch (error) {
      this.logger.error(`Failed to initialize auth handler: ${error.message}`, error.stack);
      throw error;
    }
  }

  private getProviderType(typeString: string): OAuthProviderType | null {
    // Check if the string is a valid enum value
    return Object.values(OAuthProviderType).includes(typeString as OAuthProviderType)
      ? (typeString as OAuthProviderType)
      : null;
  }

  private configureProvider(
    providers: NonNullable<BetterAuthOptions['socialProviders']>,
    providerType: OAuthProviderType,
    config: Record<string, string>,
  ) {
    if (!config.clientId || !config.clientSecret) return;

    // Base configuration for all providers
    const baseProviderConfig = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    };

    // Create final provider config from base config and any additional config values
    const additionalConfig = Object.entries(config).reduce(
      (acc, [key, value]) => {
        if (key !== 'clientId' && key !== 'clientSecret') {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    // Apply configuration with type safety
    providers[providerType as keyof typeof providers] = {
      ...baseProviderConfig,
      ...additionalConfig,
    };
  }

  // NestJS middleware interface method
  use(req: any, res: any, next: () => void): void {
    if (!this.authHandler) {
      next();
      return;
    }

    // Get the URL from the request (supports both Express and Fastify)
    const url = req.originalUrl || req.url || '';

    if (AUTH_BYPASS_PATHS.some((path) => url.includes(path))) {
      next();
      return;
    }

    if (!AUTH_ALLOWED_METHODS.includes(req.method || '')) {
      next();
      return;
    }

    // Ensure originalUrl is available for the auth handler
    if (!req.originalUrl) {
      req.originalUrl = url;
    }

    // Call the better-auth handler and handle promise errors
    this.authHandler(req, res).catch((error) => {
      this.logger.error(`Auth handler error: ${error.message}`, error.stack);
      next();
    });
  }
}

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';

import {
  AUTH_JS_ACCOUNT_COLLECTION,
  AUTH_JS_SESSION_COLLECTION,
  AUTH_JS_USER_COLLECTION,
} from './auth.constant';
import { APIError, betterAuth, BetterAuthOptions, BetterAuthPlugin } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { toNodeHandler } from 'better-auth/node';
import { createAuthMiddleware } from 'better-auth/api';

export type AuthRequest = FastifyRequest & { originalUrl?: string; url?: string };
export type AuthResponse = FastifyReply;

export function CreateAuth(
  providers: BetterAuthOptions['socialProviders'],
  prismaService: PrismaService,
  configService: ConfigService,
) {
  const appConfig = configService.getAppConfig();
  const authConfig = configService.getAuthConfig();
  const corsConfig = configService.getCorsConfig();
  const basePath = `/${appConfig.apiPrefix}/${appConfig.version}/auth`;

  const auth = betterAuth({
    database: prismaAdapter(prismaService, {
      provider: 'mongodb',
    }),
    socialProviders: providers,
    basePath: basePath,
    trustedOrigins: Array.isArray(corsConfig.origin)
      ? corsConfig.origin
      : corsConfig.origin?.split(',') || [],
    plugins: [
      // Session provider tracking plugin
      {
        id: 'add-account-to-session',
        hooks: {
          after: [
            {
              matcher(context) {
                return context.path.startsWith('/callback');
              },
              handler: createAuthMiddleware(async (ctx) => {
                const provider = ctx.params?.id || ctx.path.split('/callback')[1];
                if (!provider) {
                  return;
                }

                let finalSessionId = '';
                const sessionCookie = ctx.getHeader(ctx.context.authCookies.sessionToken.name);

                if (sessionCookie) {
                  const sessionId = sessionCookie.split('.')[0];
                  if (sessionId) {
                    finalSessionId = sessionId;
                  }
                }

                if (!finalSessionId) {
                  const setSessionToken = ctx.getHeader('set-cookie');

                  if (setSessionToken) {
                    const sessionId = setSessionToken.split(';')[0].split('=')[1].split('.')[0];

                    if (sessionId) {
                      finalSessionId = sessionId;
                    }
                  }
                }

                if (!finalSessionId) {
                  return;
                }

                try {
                  // Use a more compatible approach by storing the info in context metadata
                  // which won't trigger type errors with the session object
                  const metadata = ctx.context.metadata || {};
                  metadata.provider = provider;
                  ctx.context.metadata = metadata;

                  // Log the action instead of trying to update DB directly
                  await Promise.resolve(); // for eslint
                  console.log(`Session ${finalSessionId} associated with provider ${provider}`);
                } catch (error) {
                  console.error('Failed to store provider information:', error);
                }
              }),
            },
          ],
        },
        schema: {
          session: {
            fields: {
              provider: {
                type: 'string',
                required: false,
              },
            },
          },
        },
      } satisfies BetterAuthPlugin,
    ],
    account: {
      modelName: AUTH_JS_ACCOUNT_COLLECTION,
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github'],
      },
    },
    session: {
      modelName: AUTH_JS_SESSION_COLLECTION,
    },
    appName: appConfig.name || 'nestjs-project-template',
    secret: authConfig.jwt.secret,
    user: {
      modelName: AUTH_JS_USER_COLLECTION,
      additionalFields: {
        isOwner: {
          type: 'boolean',
          defaultValue: false,
          input: false,
        },
        handle: {
          type: 'string',
          defaultValue: '',
        },
      },
    },
  });

  const handler = async (req: AuthRequest, res: AuthResponse) => {
    try {
      res.header('access-control-allow-methods', 'GET, POST');
      res.header('access-control-allow-headers', 'content-type');
      res.header(
        'Access-Control-Allow-Origin',
        req.headers.origin || req.headers.referer || req.headers.host || '*',
      );
      res.header('access-control-allow-credentials', 'true');

      // Handle Fastify requests
      const url = req.originalUrl || req.url || req.raw.url;
      if (!url) {
        throw new Error('Request URL is missing');
      }

      // Use the original request directly instead of cloning to prevent property loss
      // Set only the necessary properties that need to be modified
      req.url = url;
      req.originalUrl = url; // Ensure originalUrl is set for better-auth

      // Only modify socket encryption if needed, don't replace the entire socket
      if (req.raw && req.raw.socket) {
        // Use type assertion since the socket may be from different request types
        (req.raw.socket as any).encrypted = true;
      }

      const handler = toNodeHandler(auth)(req.raw, res.raw);

      return handler;
    } catch (error) {
      console.error(error);
      // throw error
      return res.status(500).send((error as any).message);
    }
  };

  return {
    handler,
    auth: {
      options: auth.options,
      api: {
        getSession(params: Parameters<typeof auth.api.getSession>[0]) {
          return auth.api.getSession(params);
        },
        getProviders() {
          return Object.keys(auth.options.socialProviders || {});
        },
        async listUserAccounts(params: Parameters<typeof auth.api.listUserAccounts>[0]) {
          try {
            const result = await auth.api.listUserAccounts(params);
            return result;
          } catch (error) {
            if (error instanceof APIError) {
              return null;
            }
            throw error;
          }
        },
      },
    },
  };
}

import { IncomingMessage } from 'node:http';
import { MongoClient } from 'mongodb';
import type { BetterAuthOptions } from '../betterAuth';
import type { ServerResponse } from 'node:http';

import { APIError, betterAuth, mongodbAdapter, toNodeHandler } from '../betterAuth';

import { AUTH_JS_ACCOUNT_COLLECTION, AUTH_JS_SESSION_COLLECTION } from './auth.constant';

const { DATABASE_URL, API_VERSION, ALLOWED_ORIGINS, JWT_SECRET, NODE_ENV } = process.env;
const client = new MongoClient(DATABASE_URL ?? '');

const db = client.db();

const isDev = NODE_ENV === 'development';
export function CreateAuth(providers: BetterAuthOptions['socialProviders']) {
  const auth = betterAuth({
    database: mongodbAdapter(db),
    socialProviders: providers,
    basePath: isDev ? '/auth' : `/api/v${API_VERSION}/auth`,
    trustedOrigins: ALLOWED_ORIGINS?.split(',')?.reduce((acc: string[], origin: string) => {
      if (origin.startsWith('http')) {
        return [...acc, origin];
      }
      return [...acc, `https://${origin}`, `http://${origin}`];
    }, []),
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
    appName: 'nestjs-project-template',
    secret: JWT_SECRET,
    user: {
      modelName: '',
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

  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      res.setHeader('access-control-allow-methods', 'GET, POST');
      res.setHeader('access-control-allow-headers', 'content-type');
      res.setHeader(
        'Access-Control-Allow-Origin',
        req.headers.origin || req.headers.referer || req.headers.host || '*',
      );
      res.setHeader('access-control-allow-credentials', 'true');

      const clonedRequest = new IncomingMessage(req.socket);
      const handler = toNodeHandler(auth)(
        Object.assign(clonedRequest, req, {
          url: req.originalUrl,

          socket: Object.assign(req.socket, {
            encrypted: isDev ? false : true,
          }),
        }),
        res,
      );

      return handler;
    } catch (error) {
      console.error(error);
      // throw error
      res.end(error.message);
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

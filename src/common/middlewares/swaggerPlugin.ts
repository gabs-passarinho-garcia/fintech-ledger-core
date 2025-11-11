import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';

/**
 * Swagger plugin configuration
 * Disables Swagger documentation in production for security
 *
 * @param args - Configuration arguments
 * @param args.env - Environment string (prod, production, etc)
 * @returns Elysia plugin with Swagger or 404 handler
 */
export const swaggerPlugin = (args: { env?: string }): Elysia => {
  const error = new Elysia().get('/docs', () => new Response('Page Not Found', { status: 404 }));
  const swaggerApp = swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Fintech Ledger Core API Documentation',
        version: '0.1.0',
        description: 'High-performance financial ledger engine with atomic transaction support',
      },
      tags: [
        {
          name: 'Ledger',
          description: 'Ledger entry operations',
        },
        {
          name: 'Health',
          description: 'Health check endpoints',
        },
      ],
    },
  });

  if (args.env === 'prod' || args.env === 'production') {
    return error;
  }

  return swaggerApp as never;
};

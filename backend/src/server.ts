import './instrument';
import 'dotenv/config';
import { createApp } from './app';
import { ContainerHandler } from './common/container/ContainerHandler';
import { AppProviders } from './common/interfaces/IAppContainer';

const port = Number(Bun.env.SERVER_PORT ?? 3000);

/**
 * Application entry point.
 * Initializes and starts the Elysia server.
 */
function main(): void {
  try {
    const app = createApp();

    app.listen(
      {
        port,
        hostname: '0.0.0.0',
        reusePort: true,
      },
      () => {
        const logger = ContainerHandler.resolve(AppProviders.logger);
        const message = `🚀 Server is running on http://localhost:${port}`;
        const docsMessage = `📚 API Documentation: http://localhost:${port}/docs`;

        if (logger) {
          logger.info(
            {
              port,
              env: Bun.env.APP_ENV || Bun.env.NODE_ENV || 'dev',
            },
            'server:started',
            'Server',
          );
        }

        // eslint-disable-next-line no-console
        console.log(message);
        // eslint-disable-next-line no-console
        console.log(docsMessage);
      },
    );
  } catch (error) {
    const logger = ContainerHandler.retrieve()
      ? ContainerHandler.resolve(AppProviders.logger)
      : null;

    if (logger) {
      logger.error(
        {
          error: error as Error,
        },
        'server:start_failed',
        'Server',
      );
    }

    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

import { type Prisma, PrismaClient } from 'prisma/client';
import { Logger } from './Logger';

const DATABASE_EVENT_TAG = 'database-event';

/**
 * PrismaHandler extends PrismaClient with custom logging and event handling.
 * Provides structured logging for database operations in development.
 */
export class PrismaHandler extends PrismaClient<
  Prisma.PrismaClientOptions,
  'query' | 'info' | 'warn' | 'error'
> {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    this.$on('info', (e) => {
      Logger.logStatic(
        'info',
        { message: e.message, target: e.target },
        DATABASE_EVENT_TAG,
        PrismaHandler.name,
      );
    });

    this.$on('warn', (e) => {
      Logger.logStatic(
        'warn',
        { message: e.message, target: e.target },
        DATABASE_EVENT_TAG,
        PrismaHandler.name,
      );
    });

    this.$on('error', (e) => {
      Logger.logStatic(
        'error',
        { message: e.message, target: e.target },
        DATABASE_EVENT_TAG,
        PrismaHandler.name,
      );
    });
  }
}

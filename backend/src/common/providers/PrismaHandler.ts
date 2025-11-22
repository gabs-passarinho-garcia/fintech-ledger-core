import { type Prisma, PrismaClient } from 'prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Logger } from './Logger';

const DATABASE_EVENT_TAG = 'database-event';

/**
 * PrismaHandler extends PrismaClient with custom logging and event handling.
 * Provides structured logging for database operations in development.
 */
export class PrismaHandler extends PrismaClient<Prisma.PrismaClientOptions> {
  constructor(deps: { adapter: PrismaPg }) {
    super({
      adapter: deps.adapter,
      log: [
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    this.$on('info' as never, (e: Prisma.LogEvent) => {
      Logger.logStatic(
        'info',
        { message: e.message, target: e.target },
        DATABASE_EVENT_TAG,
        PrismaHandler.name,
      );
    });

    this.$on('warn' as never, (e: Prisma.LogEvent) => {
      Logger.logStatic(
        'warn',
        { message: e.message, target: e.target },
        DATABASE_EVENT_TAG,
        PrismaHandler.name,
      );
    });

    this.$on('error' as never, (e: Prisma.LogEvent) => {
      Logger.logStatic(
        'error',
        { message: e.message, target: e.target },
        DATABASE_EVENT_TAG,
        PrismaHandler.name,
      );
    });
  }
}

/**
 * Factory function to create PrismaHandler instance with PrismaPg adapter.
 * Uses Bun.env.DATABASE_URL for connection string.
 */
export function providePrisma(): PrismaHandler {
  const adapter = new PrismaPg({
    connectionString: Bun.env.DATABASE_URL,
  });
  return new PrismaHandler({
    adapter,
  });
}

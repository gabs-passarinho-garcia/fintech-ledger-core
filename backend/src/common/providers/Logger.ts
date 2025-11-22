import winston from 'winston';
import type { ILogger, LogLevelType } from '../adapters';
import type { SessionHandler } from './SessionHandler';
import { AppProviders } from '../interfaces/IAppContainer';

export interface StandardLogEntry {
  timestamp: string;
  body: unknown;
  service: string;
  type: string;
  level: LogLevelType;
  cid?: string;
}

const developmentFormat = winston.format.printf(({ level, timestamp, ...meta }) => {
  const log = meta as unknown as StandardLogEntry;
  const { body, type, service, cid } = log;

  const timestampFormatted = new Date(timestamp as string).toLocaleTimeString('pt-BR');
  const levelFormatted = `[${level.toUpperCase()}]`;
  const serviceFormatted = `[${service}]`;
  const typeFormatted = `(${type})`;
  const cidFormatted = cid ? ` [cid: ${cid}]` : '';

  let bodyFormatted = '';
  if (typeof body === 'object') {
    bodyFormatted = `\n${JSON.stringify(body, null, 2)}`;
  } else {
    bodyFormatted = ` ${String(body)}`;
  }

  return `${timestampFormatted} ${levelFormatted}${serviceFormatted}${typeFormatted}${cidFormatted}${bodyFormatted}`;
});

const productionFormat = winston.format.json();

/**
 * Logger implementation using Winston for structured logging.
 * Provides different formats for development and production environments.
 */
export class Logger implements ILogger {
  private service: string;
  private readonly winstonLogger: winston.Logger;
  private readonly sessionHandler?: SessionHandler;
  private static staticLoggerInstance: Logger | null = null;

  /**
   * Creates a new Logger instance.
   * SessionHandler is optional to maintain compatibility with static logger usage.
   * When provided via dependency injection, correlationId will be automatically included in logs.
   *
   * @param opts - Optional dependency injection options
   * @param opts.sessionHandler - Optional SessionHandler for automatic correlationId injection
   */
  constructor(opts?: { [AppProviders.sessionHandler]?: SessionHandler }) {
    this.service = 'Logger';
    this.sessionHandler = opts?.[AppProviders.sessionHandler];
    const appEnv = process.env.APP_ENV || process.env.NODE_ENV || 'dev';
    const isProduction = ['prod', 'production'].includes(appEnv);
    const isLocal = appEnv === 'local' || appEnv === 'dev';

    this.winstonLogger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        isLocal ? developmentFormat : productionFormat,
      ),
      transports: [new winston.transports.Console()],
    });
  }

  /**
   * Sets the service name for this logger instance.
   *
   * @param serviceName - The name of the service
   * @returns The logger instance for method chaining
   */
  public setService(serviceName: string): Logger {
    this.service = serviceName;
    return this;
  }

  /**
   * Logs a message at the specified level.
   * Automatically includes correlationId from SessionHandler when available.
   *
   * @param level - The log level
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public log(level: LogLevelType, body: unknown, type: string, service?: string): void {
    const serviceName = service || this.service;

    // Automatically get correlationId from SessionHandler if available
    let correlationId: string | undefined;
    if (this.sessionHandler) {
      try {
        const sessionData = this.sessionHandler.get();
        correlationId = sessionData.correlationId;
      } catch {
        // SessionHandler context might not be initialized (e.g., static logger)
        // Silently ignore and continue without correlationId
      }
    }

    const entry: StandardLogEntry = {
      timestamp: new Date().toISOString(),
      body,
      service: serviceName,
      type,
      level,
      cid: correlationId,
    };
    this.winstonLogger.log(level, `[${type}] ${serviceName}`, entry);
  }

  /**
   * Logs an info message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public info(body: unknown, type: string, service?: string): void {
    this.log('info', body, type, service);
  }

  /**
   * Logs a warning message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public warn(body: unknown, type: string, service?: string): void {
    this.log('warn', body, type, service);
  }

  /**
   * Logs an error message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public error(body: unknown, type: string, service?: string): void {
    this.log('error', body, type, service);
  }

  /**
   * Logs a debug message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public debug(body: unknown, type: string, service?: string): void {
    this.log('debug', body, type, service);
  }

  /**
   * Static method to log messages without requiring a logger instance.
   * Useful for logging in static contexts or during initialization.
   *
   * @param level - The log level
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - The service name
   */
  public static logStatic(level: LogLevelType, body: unknown, type: string, service: string): void {
    const logger = Logger.getStaticLoggerInstance();
    logger.log(level, body, type, service);
  }

  /**
   * Gets or creates a static logger instance.
   *
   * @returns The static logger instance
   */
  private static getStaticLoggerInstance(): Logger {
    if (!Logger.staticLoggerInstance) {
      Logger.staticLoggerInstance = new Logger();
      Logger.staticLoggerInstance.setService('StaticLogger');
    }
    return Logger.staticLoggerInstance;
  }
}

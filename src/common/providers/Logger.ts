import winston from 'winston';
import type { ILogger, LogLevelType } from '../adapters';

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
  private static staticLoggerInstance: Logger | null = null;

  constructor() {
    this.service = 'Logger';
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
   *
   * @param level - The log level
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public log(level: LogLevelType, body: unknown, type: string, service?: string): void {
    const serviceName = service || this.service;
    const entry: StandardLogEntry = {
      timestamp: new Date().toISOString(),
      body,
      service: serviceName,
      type,
      level,
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

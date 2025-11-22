/**
 * Log level types for structured logging.
 */
export type LogLevelType = 'debug' | 'info' | 'warn' | 'error';

/**
 * Interface for logging functionality.
 * Provides structured logging methods for different log levels.
 */
export interface ILogger {
  /**
   * Logs a message at the specified level.
   *
   * @param level - The log level
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  log(level: LogLevelType, body: unknown, type: string, service?: string): void;

  /**
   * Logs an info message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  info(body: unknown, type: string, service?: string): void;

  /**
   * Logs a warning message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  warn(body: unknown, type: string, service?: string): void;

  /**
   * Logs an error message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  error(body: unknown, type: string, service?: string): void;

  /**
   * Logs a debug message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  debug(body: unknown, type: string, service?: string): void;
}

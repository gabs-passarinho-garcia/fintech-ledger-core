import { getCorrelationId } from "./correlationId";

/**
 * Log level types for structured logging
 */
export type LogLevelType = "debug" | "info" | "warn" | "error";

/**
 * Standard log entry structure
 */
export interface StandardLogEntry {
  timestamp: string;
  body: unknown;
  service: string;
  type: string;
  level: LogLevelType;
  cid?: string;
}

/**
 * Logger implementation for frontend.
 * Automatically includes correlationId in all logs.
 * Provides structured logging similar to backend Logger.
 */
export class Logger {
  private service: string;

  /**
   * Creates a new Logger instance.
   *
   * @param serviceName - The name of the service using this logger
   */
  constructor(serviceName: string = "Frontend") {
    this.service = serviceName;
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
   * Formats log entry for development environment.
   *
   * @param entry - The log entry to format
   * @returns Formatted log string
   */
  private formatLogEntry(entry: StandardLogEntry): string {
    const timestampFormatted = new Date(entry.timestamp).toLocaleTimeString(
      "pt-BR",
    );
    const levelFormatted = `[${entry.level.toUpperCase()}]`;
    const serviceFormatted = `[${entry.service}]`;
    const typeFormatted = `(${entry.type})`;
    const cidFormatted = entry.cid ? ` [cid: ${entry.cid}]` : "";

    let bodyFormatted = "";
    if (typeof entry.body === "object") {
      bodyFormatted = `\n${JSON.stringify(entry.body, null, 2)}`;
    } else {
      bodyFormatted = ` ${String(entry.body)}`;
    }

    return `${timestampFormatted} ${levelFormatted}${serviceFormatted}${typeFormatted}${cidFormatted}${bodyFormatted}`;
  }

  /**
   * Logs a message at the specified level.
   * Automatically includes correlationId from sessionStorage.
   * Silences logs during test execution.
   *
   * @param level - The log level
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public log(
    level: LogLevelType,
    body: unknown,
    type: string,
    service?: string,
  ): void {
    // Silence logs during test execution
    if (
      typeof process !== "undefined" &&
      (process.env.NODE_ENV === "test" ||
        process.env.BUN_ENV === "test" ||
        globalThis.Bun?.env?.NODE_ENV === "test")
    ) {
      return;
    }

    const serviceName = service || this.service;

    // Automatically get correlationId
    let correlationId: string | undefined;
    try {
      correlationId = getCorrelationId();
    } catch {
      // Silently ignore if correlationId is not available
    }

    const entry: StandardLogEntry = {
      timestamp: new Date().toISOString(),
      body,
      service: serviceName,
      type,
      level,
      cid: correlationId,
    };

    const formattedLog = this.formatLogEntry(entry);

    // Use appropriate console method based on level
    switch (level) {
      case "debug":
        console.info(formattedLog);
        break;
      case "info":
        console.info(formattedLog);
        break;
      case "warn":
        console.warn(formattedLog);
        break;
      case "error":
        console.error(formattedLog);
        break;
      default:
        console.info(formattedLog);
    }
  }

  /**
   * Logs an info message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public info(body: unknown, type: string, service?: string): void {
    this.log("info", body, type, service);
  }

  /**
   * Logs a warning message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public warn(body: unknown, type: string, service?: string): void {
    this.log("warn", body, type, service);
  }

  /**
   * Logs an error message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public error(body: unknown, type: string, service?: string): void {
    this.log("error", body, type, service);
  }

  /**
   * Logs a debug message.
   *
   * @param body - The log message or object
   * @param type - The log type/category
   * @param service - Optional service name
   */
  public debug(body: unknown, type: string, service?: string): void {
    this.log("debug", body, type, service);
  }
}

/**
 * Default logger instance for general use
 */
export const logger = new Logger("Frontend");

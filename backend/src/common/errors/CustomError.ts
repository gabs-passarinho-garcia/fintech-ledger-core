import { ErrorDto } from '@/common/errors/ErrorSchema';
import type { HTTPStatusCode } from '../enums';
import type { ErrorCode, ErrorName } from '../enums';

/**
 * CustomError is an abstract class that extends the built-in Error class.
 * It provides additional properties for HTTP status codes, error codes,
 * and error names, allowing for more informative error handling.
 */
export abstract class CustomError extends Error {
  /**
   * The HTTP status code associated with the error.
   */
  public readonly statusCode: HTTPStatusCode;

  /**
   * A specific error code that identifies the type of error.
   */
  public readonly errorCode: ErrorCode;

  /**
   * A descriptive name for the error.
   */
  public readonly errorName: ErrorName;

  /**
   * An optional path for context.
   */
  public path?: string;

  /**
   * An optional data object containing request details.
   */
  public data?: {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: unknown;
  };

  /**
   * Constructs a new CustomError instance.
   *
   * @param data - An object containing error details.
   * @param data.statusCode - The HTTP status code for the error.
   * @param data.errorCode - A specific error code.
   * @param data.errorName - A descriptive name for the error.
   * @param data.message - A message describing the error.
   * @param data.path - An optional path for context.
   * @param data.data - An optional data object containing request details.
   * @param data.originalError - An optional original error for context.
   */
  constructor(data: {
    statusCode: HTTPStatusCode;
    errorCode: ErrorCode;
    errorName: ErrorName;
    message: string;
    path?: string;
    data?: {
      params?: Record<string, unknown>;
      query?: Record<string, unknown>;
      body?: unknown;
    };
    originalError?: unknown;
  }) {
    super(data.message);
    Object.setPrototypeOf(this, new.target.prototype);
    if (data.originalError) {
      console.error(data.originalError);
      this.cause = data.originalError;
      if (data.originalError instanceof Error) {
        this.stack = data.originalError.stack;
        this.message = data.originalError.message;
        this.name = data.originalError.name;
        if (!this.stack) Error.captureStackTrace?.(this, CustomError);
        if (data.originalError instanceof CustomError) {
          this.statusCode = data.originalError.statusCode;
          this.errorCode = data.originalError.errorCode;
          this.errorName = data.originalError.errorName;
          this.path = data.originalError.path;
          this.data = data.originalError.data;
          this.message = data.originalError.message;
          return;
        }
      }
    }
    this.statusCode = data.statusCode;
    this.name = data.errorName;
    this.errorCode = data.errorCode;
    this.errorName = data.errorName;
    this.message = data.message;
    this.path = data.path;
    this.data = data.data;
  }

  /**
   * Converts the error to a JSON-serializable format.
   *
   * @returns An ErrorDto object representing this error.
   */
  public toJSON(): ErrorDto {
    return {
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      errorName: this.errorName,
      message: this.message,
      path: this.path,
    };
  }
}

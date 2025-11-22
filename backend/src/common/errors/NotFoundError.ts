import { CustomError } from './CustomError';
import { ErrorName, ErrorCode, ErrorMessage, HTTPStatusCode } from '../enums';

/**
 * NotFoundError represents a resource not found error.
 * This error is used when a requested resource does not exist.
 */
export class NotFoundError extends CustomError {
  /**
   * Constructs a new NotFoundError instance.
   *
   * @param data - An object containing error details.
   * @param data.message - The error message
   * @param data.path - An optional path for context.
   * @param data.data - An optional data object containing request details.
   */
  public constructor(data: {
    message: string;
    path?: string;
    data?: {
      params?: Record<string, unknown>;
      query?: Record<string, unknown>;
      body?: unknown;
    };
    correlationId?: string;
  }) {
    super({
      statusCode: HTTPStatusCode.NOT_FOUND,
      errorCode: ErrorCode.NOT_FOUND,
      errorName: ErrorName[ErrorCode.NOT_FOUND],
      message: data.message || ErrorMessage[ErrorCode.NOT_FOUND],
      path: data.path,
      data: data.data,
      correlationId: data.correlationId,
    });
  }
}

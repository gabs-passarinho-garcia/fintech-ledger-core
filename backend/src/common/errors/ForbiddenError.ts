import { CustomError } from './CustomError';
import { ErrorName, ErrorCode, ErrorMessage, HTTPStatusCode } from '../enums';

/**
 * ForbiddenError represents an authorization error.
 * This error is used when a user does not have permission to perform an action.
 */
export class ForbiddenError extends CustomError {
  /**
   * Constructs a new ForbiddenError instance.
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
  }) {
    super({
      statusCode: HTTPStatusCode.FORBIDDEN,
      errorCode: ErrorCode.NOT_AUTHORIZED,
      errorName: ErrorName[ErrorCode.NOT_AUTHORIZED],
      message: data.message || ErrorMessage[ErrorCode.NOT_AUTHORIZED],
      path: data.path,
      data: data.data,
    });
  }
}

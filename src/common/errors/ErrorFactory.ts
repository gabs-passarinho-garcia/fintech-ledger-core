import { InternalError } from './InternalError';
import { CustomError } from './CustomError';

/**
 * Factory for creating standardized error instances.
 * Ensures all errors follow the same structure and can be properly serialized.
 */
export class ErrorFactory {
  /**
   * Creates a CustomError from an unknown error type.
   * If the error is already a CustomError, it enriches it with path and data.
   * Otherwise, wraps it in an InternalError.
   *
   * @param error - The error to process
   * @param path - Optional request path where the error occurred
   * @param data - Optional additional context (params, query, body)
   * @returns A CustomError instance
   */
  public static createError(
    error: unknown,
    path?: string,
    data?: {
      params?: Record<string, unknown>;
      query?: Record<string, unknown>;
      body?: unknown;
    },
  ): CustomError {
    if (error instanceof CustomError) {
      error.path = path;
      error.data = data;
      return error;
    }

    if (error instanceof Error) {
      return new InternalError({
        originalError: error,
        additionalMessage: error.message,
        path,
        data,
      });
    }

    return new InternalError({
      additionalMessage: `Unknown error, ${error}`,
      path,
      data,
    });
  }
}

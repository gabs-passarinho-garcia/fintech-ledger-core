import { CustomError } from './CustomError';
import { ErrorName, ErrorCode, ErrorMessage, HTTPStatusCode } from '../enums';

/**
 * InternalError is a specific implementation of CustomError
 * that represents an internal server error.
 */
export class InternalError extends CustomError {
  /**
   * Constructs a new InternalError instance.
   *
   * @param data - An object containing error details.
   * @param data.originalError - An optional original error for context.
   * @param data.additionalMessage - An optional additional message to provide more context.
   * @param data.path - An optional path for context.
   * @param data.data - An optional data object containing request details.
   */
  public constructor(data?: {
    originalError?: unknown;
    additionalMessage?: string;
    path?: string;
    data?: {
      params?: Record<string, unknown>;
      query?: Record<string, unknown>;
      body?: unknown;
    };
  }) {
    super({
      statusCode: HTTPStatusCode.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_ERROR,
      errorName: ErrorName[ErrorCode.INTERNAL_ERROR],
      message: data?.additionalMessage
        ? ErrorMessage[ErrorCode.INTERNAL_ERROR] + ': ' + data.additionalMessage
        : ErrorMessage[ErrorCode.INTERNAL_ERROR],
      originalError: data?.originalError,
      path: data?.path,
      data: data?.data,
    });
  }
}

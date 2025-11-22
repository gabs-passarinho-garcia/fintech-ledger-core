import { CustomError } from './CustomError';
import { ErrorName, ErrorCode, ErrorMessage, HTTPStatusCode } from '../enums';

/**
 * ExternalSourceError represents an error from an external service or API.
 * This error is used when communication with external systems fails.
 */
export class ExternalSourceError extends CustomError {
  /**
   * Constructs a new ExternalSourceError instance.
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
    correlationId?: string;
  }) {
    super({
      statusCode: HTTPStatusCode.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.EXTERNAL_SOURCE_ERROR,
      errorName: ErrorName[ErrorCode.EXTERNAL_SOURCE_ERROR],
      message: data?.additionalMessage
        ? ErrorMessage[ErrorCode.EXTERNAL_SOURCE_ERROR] + ': ' + data.additionalMessage
        : ErrorMessage[ErrorCode.EXTERNAL_SOURCE_ERROR],
      originalError: data?.originalError,
      path: data?.path,
      data: data?.data,
      correlationId: data?.correlationId,
    });
  }
}

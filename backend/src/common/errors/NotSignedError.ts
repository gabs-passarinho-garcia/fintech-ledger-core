import { CustomError } from './CustomError';
import { ErrorName, ErrorCode, ErrorMessage, HTTPStatusCode } from '../enums';

/**
 * NotSignedError is a specific implementation of CustomError
 * that represents an authentication/authorization error.
 * Used when a user is not authenticated or authentication fails.
 */
export class NotSignedError extends CustomError {
  /**
   * Constructs a new NotSignedError instance.
   *
   * @param data - An object containing error details.
   * @param data.originalError - An optional original error for context.
   * @param data.additionalMessage - An optional additional message to provide more context.
   */
  public constructor(data?: {
    originalError?: unknown;
    additionalMessage?: string;
    correlationId?: string;
  }) {
    super({
      statusCode: HTTPStatusCode.UNAUTHORIZED,
      errorCode: ErrorCode.NOT_SIGNED,
      errorName: ErrorName[ErrorCode.NOT_SIGNED],
      message: data?.additionalMessage
        ? ErrorMessage[ErrorCode.NOT_SIGNED] + ': ' + data.additionalMessage
        : ErrorMessage[ErrorCode.NOT_SIGNED],
      originalError: data?.originalError,
      correlationId: data?.correlationId,
    });
  }
}

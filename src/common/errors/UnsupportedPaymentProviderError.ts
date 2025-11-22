import { CustomError } from './CustomError';
import { ErrorName, ErrorCode, ErrorMessage, HTTPStatusCode } from '../enums';

/**
 * UnsupportedPaymentProviderError is thrown when a payment provider is requested
 * but is not yet supported or implemented in the system.
 */
export class UnsupportedPaymentProviderError extends CustomError {
  /**
   * Constructs a new UnsupportedPaymentProviderError instance.
   *
   * @param data - An object containing error details.
   * @param data.originalError - An optional original error for context.
   * @param data.additionalMessage - An optional additional message to provide more context.
   */
  public constructor(data?: { originalError?: unknown; additionalMessage?: string }) {
    super({
      statusCode: HTTPStatusCode.UNPROCESSABLE_ENTITY,
      errorCode: ErrorCode.UNSUPPORTED_PAYMENT_PROVIDER,
      errorName: ErrorName[ErrorCode.UNSUPPORTED_PAYMENT_PROVIDER],
      message: data?.additionalMessage
        ? ErrorMessage[ErrorCode.UNSUPPORTED_PAYMENT_PROVIDER] + ': ' + data.additionalMessage
        : ErrorMessage[ErrorCode.UNSUPPORTED_PAYMENT_PROVIDER],
      originalError: data?.originalError,
    });
  }
}

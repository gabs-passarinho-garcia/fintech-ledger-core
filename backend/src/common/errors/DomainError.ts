import { CustomError } from './CustomError';
import { ErrorName, ErrorCode, HTTPStatusCode } from '../enums';

/**
 * DomainError represents a violation of business rules or domain constraints.
 * This error is used when a domain entity validation fails or a business rule is violated.
 */
export class DomainError extends CustomError {
  /**
   * Constructs a new DomainError instance.
   *
   * @param data - An object containing error details.
   * @param data.message - The error message describing the domain rule violation.
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
      statusCode: HTTPStatusCode.UNPROCESSABLE_ENTITY,
      errorCode: ErrorCode.DOMAIN_ERROR,
      errorName: ErrorName[ErrorCode.DOMAIN_ERROR],
      message: data.message,
      path: data.path,
      data: data.data,
    });
  }
}

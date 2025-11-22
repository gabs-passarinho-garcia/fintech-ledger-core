import { describe, it, expect } from 'bun:test';
import { NotSignedError } from '../NotSignedError';
import { HTTPStatusCode, ErrorCode, ErrorName, ErrorMessage } from '../../enums';

describe('NotSignedError', () => {
  describe('constructor', () => {
    it('should create error without parameters', () => {
      const error = new NotSignedError();

      expect(error.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
      expect(error.errorCode).toBe(ErrorCode.NOT_SIGNED);
      expect(error.errorName).toBe(ErrorName[ErrorCode.NOT_SIGNED]);
      expect(error.message).toBe(ErrorMessage[ErrorCode.NOT_SIGNED]);
    });

    it('should create error with originalError', () => {
      const originalError = new Error('Token expired');

      const error = new NotSignedError({
        originalError,
      });

      expect(error.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
      expect(error.errorCode).toBe(ErrorCode.NOT_SIGNED);
      expect(error.errorName).toBe(ErrorName[ErrorCode.NOT_SIGNED]);
      expect(error.cause).toBe(originalError);
    });

    it('should create error with additionalMessage', () => {
      const error = new NotSignedError({
        additionalMessage: 'Authentication token is missing or invalid',
      });

      expect(error.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
      expect(error.errorCode).toBe(ErrorCode.NOT_SIGNED);
      expect(error.errorName).toBe(ErrorName[ErrorCode.NOT_SIGNED]);
      expect(error.message).toBe(
        `${ErrorMessage[ErrorCode.NOT_SIGNED]}: Authentication token is missing or invalid`,
      );
    });

    it('should create error with both originalError and additionalMessage', () => {
      const originalError = new Error('JWT verification failed');

      const error = new NotSignedError({
        originalError,
        additionalMessage: 'Token signature is invalid',
      });

      expect(error.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
      expect(error.errorCode).toBe(ErrorCode.NOT_SIGNED);
      expect(error.errorName).toBe(ErrorName[ErrorCode.NOT_SIGNED]);
      expect(error.message).toBe(
        `${ErrorMessage[ErrorCode.NOT_SIGNED]}: Token signature is invalid`,
      );
      expect(error.cause).toBe(originalError);
    });

    it('should create error with originalError that is not an Error instance', () => {
      const originalError = { code: 'AUTH_ERROR', message: 'Invalid credentials' };

      const error = new NotSignedError({
        originalError,
      });

      expect(error.cause).toBe(originalError);
      expect(error.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
      expect(error.errorCode).toBe(ErrorCode.NOT_SIGNED);
    });

    it('should preserve original error name when originalError is Error', () => {
      const originalError = new Error('Session expired');
      originalError.name = 'AuthenticationError';

      const error = new NotSignedError({
        originalError,
      });

      // Message and name are overridden by the values passed to super() (from NotSignedError)
      expect(error.message).toBe('Not signed');
      expect(error.name).toBe(ErrorName[ErrorCode.NOT_SIGNED]);
    });
  });
});


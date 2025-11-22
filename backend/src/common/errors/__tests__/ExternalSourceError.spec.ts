import { describe, it, expect } from 'bun:test';
import { ExternalSourceError } from '../ExternalSourceError';
import { HTTPStatusCode, ErrorCode, ErrorName, ErrorMessage } from '../../enums';

describe('ExternalSourceError', () => {
  describe('constructor', () => {
    it('should create error without parameters', () => {
      const error = new ExternalSourceError();

      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.EXTERNAL_SOURCE_ERROR);
      expect(error.errorName).toBe(ErrorName[ErrorCode.EXTERNAL_SOURCE_ERROR]);
      expect(error.message).toBe(ErrorMessage[ErrorCode.EXTERNAL_SOURCE_ERROR]);
      expect(error.path).toBeUndefined();
      expect(error.data).toBeUndefined();
    });

    it('should create error with originalError', () => {
      const originalError = new Error('External API error');

      const error = new ExternalSourceError({
        originalError,
      });

      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.EXTERNAL_SOURCE_ERROR);
      expect(error.errorName).toBe(ErrorName[ErrorCode.EXTERNAL_SOURCE_ERROR]);
      expect(error.cause).toBe(originalError);
    });

    it('should create error with additionalMessage', () => {
      const error = new ExternalSourceError({
        additionalMessage: 'Failed to connect to payment gateway',
      });

      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.EXTERNAL_SOURCE_ERROR);
      expect(error.errorName).toBe(ErrorName[ErrorCode.EXTERNAL_SOURCE_ERROR]);
      expect(error.message).toBe(
        `${ErrorMessage[ErrorCode.EXTERNAL_SOURCE_ERROR]}: Failed to connect to payment gateway`,
      );
    });

    it('should create error with path', () => {
      const error = new ExternalSourceError({
        path: '/api/payments',
      });

      expect(error.path).toBe('/api/payments');
      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.EXTERNAL_SOURCE_ERROR);
    });

    it('should create error with data', () => {
      const error = new ExternalSourceError({
        data: {
          params: { paymentId: '123' },
          query: { retry: 'true' },
          body: { amount: 100 },
        },
      });

      expect(error.data).toEqual({
        params: { paymentId: '123' },
        query: { retry: 'true' },
        body: { amount: 100 },
      });
    });

    it('should create error with all parameters', () => {
      const originalError = new Error('Network timeout');
      const error = new ExternalSourceError({
        originalError,
        additionalMessage: 'Payment gateway timeout',
        path: '/api/payments/process',
        data: {
          params: { paymentId: '456' },
          query: { timeout: '30s' },
          body: { amount: 200 },
        },
      });

      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.EXTERNAL_SOURCE_ERROR);
      expect(error.errorName).toBe(ErrorName[ErrorCode.EXTERNAL_SOURCE_ERROR]);
      expect(error.message).toBe(
        `${ErrorMessage[ErrorCode.EXTERNAL_SOURCE_ERROR]}: Payment gateway timeout`,
      );
      expect(error.cause).toBe(originalError);
      expect(error.path).toBe('/api/payments/process');
      expect(error.data).toEqual({
        params: { paymentId: '456' },
        query: { timeout: '30s' },
        body: { amount: 200 },
      });
    });

    it('should create error with originalError that is not an Error instance', () => {
      const originalError = { code: 'NETWORK_ERROR', message: 'Connection failed' };

      const error = new ExternalSourceError({
        originalError,
      });

      expect(error.cause).toBe(originalError);
      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.EXTERNAL_SOURCE_ERROR);
    });
  });
});


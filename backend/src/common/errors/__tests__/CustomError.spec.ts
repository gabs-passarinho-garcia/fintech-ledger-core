import { describe, it, expect, mock } from 'bun:test';
import { DomainError } from '../DomainError';
import { InternalError } from '../InternalError';
import { HTTPStatusCode, ErrorCode, ErrorName } from '../../enums';

describe('CustomError', () => {
  describe('constructor', () => {
    it('should create error with all properties', () => {
      const error = new DomainError({
        message: 'Test error',
        path: '/test/path',
        data: {
          params: { id: '123' },
          query: { page: '1' },
          body: { name: 'test' },
        },
      });

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
      expect(error.errorCode).toBe(ErrorCode.DOMAIN_ERROR);
      expect(error.errorName).toBe(ErrorName[ErrorCode.DOMAIN_ERROR]);
      expect(error.path).toBe('/test/path');
      expect(error.data).toEqual({
        params: { id: '123' },
        query: { page: '1' },
        body: { name: 'test' },
      });
    });

    it('should handle originalError as regular Error', () => {
      const originalError = new Error('Original error message');
      originalError.stack = 'Error stack trace';
      originalError.name = 'TypeError';

      const consoleErrorSpy = mock(() => {});
      const originalConsoleError = console.error;
      console.error = consoleErrorSpy;

      const error = new InternalError({
        originalError,
        additionalMessage: 'Additional context',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(originalError);
      expect(error.cause).toBe(originalError);
      expect(error.stack).toBe('Error stack trace');
      // Message and name are overridden by the values passed to super() (from InternalError)
      expect(error.message).toContain('Internal error');
      expect(error.message).toContain('Additional context');
      expect(error.name).toBe(ErrorName[ErrorCode.INTERNAL_ERROR]);

      console.error = originalConsoleError;
    });

    it('should handle originalError as CustomError', () => {
      const originalError = new DomainError({
        message: 'Original domain error',
        path: '/original/path',
        data: {
          params: { id: '456' },
        },
      });

      const consoleErrorSpy = mock(() => {});
      const originalConsoleError = console.error;
      console.error = consoleErrorSpy;

      const error = new InternalError({
        originalError,
        additionalMessage: 'Wrapped error',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(originalError);
      expect(error.statusCode).toBe(originalError.statusCode);
      expect(error.errorCode).toBe(originalError.errorCode);
      expect(error.errorName).toBe(originalError.errorName);
      expect(error.path).toBe(originalError.path);
      expect(error.data).toEqual(originalError.data);
      expect(error.message).toBe(originalError.message);

      console.error = originalConsoleError;
    });

    it('should handle originalError that is not an Error instance', () => {
      const originalError = { code: 'CUSTOM_ERROR', message: 'Not an Error' };

      const consoleErrorSpy = mock(() => {});
      const originalConsoleError = console.error;
      console.error = consoleErrorSpy;

      const error = new InternalError({
        originalError,
        additionalMessage: 'Wrapped non-Error',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(originalError);
      expect(error.cause).toBe(originalError);
      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);

      console.error = originalConsoleError;
    });

    it('should handle Error without stack trace', () => {
      const originalError = new Error('Error without stack');
      originalError.stack = undefined;

      const consoleErrorSpy = mock(() => {});
      const originalConsoleError = console.error;
      console.error = consoleErrorSpy;

      const error = new InternalError({
        originalError,
      });

      expect(error.cause).toBe(originalError);
      // Message is overridden by the message passed to super() (from InternalError)
      expect(error.message).toBe('Internal error');
      // Should still have a stack trace from Error.captureStackTrace if available
      
      expect(error.stack).toBeDefined();
 

      console.error = originalConsoleError;
    });
  });

  describe('toJSON', () => {
    it('should convert error to ErrorDto format', () => {
      const error = new DomainError({
        message: 'Test error message',
        path: '/api/test',
      });

      const json = error.toJSON();

      expect(json).toEqual({
        statusCode: HTTPStatusCode.UNPROCESSABLE_ENTITY,
        errorCode: ErrorCode.DOMAIN_ERROR,
        errorName: ErrorName[ErrorCode.DOMAIN_ERROR],
        message: 'Test error message',
        path: '/api/test',
      });
    });

    it('should convert error to ErrorDto without optional fields', () => {
      const error = new DomainError({
        message: 'Test error message',
      });

      const json = error.toJSON();

      expect(json).toEqual({
        statusCode: HTTPStatusCode.UNPROCESSABLE_ENTITY,
        errorCode: ErrorCode.DOMAIN_ERROR,
        errorName: ErrorName[ErrorCode.DOMAIN_ERROR],
        message: 'Test error message',
        path: undefined,
      });
    });

    it('should preserve all error properties in JSON', () => {
      const error = new InternalError({
        additionalMessage: 'Internal server error',
        path: '/api/users',
        data: {
          params: { userId: '123' },
        },
      });

      const json = error.toJSON();

      expect(json.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(json.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
      expect(json.errorName).toBe(ErrorName[ErrorCode.INTERNAL_ERROR]);
      expect(json.message).toContain('Internal error');
      expect(json.path).toBe('/api/users');
    });
  });
});


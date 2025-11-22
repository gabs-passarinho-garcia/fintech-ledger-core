import { describe, it, expect } from 'bun:test';
import { ErrorFactory } from '../ErrorFactory';
import { InternalError } from '../InternalError';
import { DomainError } from '../DomainError';
import { HTTPStatusCode, ErrorCode, ErrorName } from '../../enums';

describe('ErrorFactory', () => {
  describe('createError', () => {
    it('should enrich CustomError with path and data', () => {
      const customError = new DomainError({
        message: 'Domain error',
      });

      const enrichedError = ErrorFactory.createError(customError, '/api/test', {
        params: { id: '123' },
        query: { page: '1' },
        body: { name: 'test' },
      });

      expect(enrichedError).toBe(customError);
      expect(enrichedError.path).toBe('/api/test');
      expect(enrichedError.data).toEqual({
        params: { id: '123' },
        query: { page: '1' },
        body: { name: 'test' },
      });
    });

    it('should enrich CustomError with only path', () => {
      const customError = new DomainError({
        message: 'Domain error',
      });

      const enrichedError = ErrorFactory.createError(customError, '/api/test');

      expect(enrichedError).toBe(customError);
      expect(enrichedError.path).toBe('/api/test');
      expect(enrichedError.data).toBeUndefined();
    });

    it('should enrich CustomError with only data', () => {
      const customError = new DomainError({
        message: 'Domain error',
      });

      const enrichedError = ErrorFactory.createError(customError, undefined, {
        params: { id: '123' },
      });

      expect(enrichedError).toBe(customError);
      expect(enrichedError.path).toBeUndefined();
      expect(enrichedError.data).toEqual({
        params: { id: '123' },
      });
    });

    it('should wrap regular Error in InternalError', () => {
      const regularError = new Error('Regular error message');

      const wrappedError = ErrorFactory.createError(regularError, '/api/test', {
        params: { id: '123' },
      });

      expect(wrappedError).toBeInstanceOf(InternalError);
      expect(wrappedError.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(wrappedError.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
      expect(wrappedError.errorName).toBe(ErrorName[ErrorCode.INTERNAL_ERROR]);
      expect(wrappedError.path).toBe('/api/test');
      expect(wrappedError.data).toEqual({
        params: { id: '123' },
      });
      expect(wrappedError.message).toContain('Regular error message');
    });

    it('should wrap regular Error without path and data', () => {
      const regularError = new Error('Regular error message');

      const wrappedError = ErrorFactory.createError(regularError);

      expect(wrappedError).toBeInstanceOf(InternalError);
      expect(wrappedError.path).toBeUndefined();
      expect(wrappedError.data).toBeUndefined();
      expect(wrappedError.message).toContain('Regular error message');
    });

    it('should wrap unknown error value in InternalError', () => {
      const unknownError = { code: 'CUSTOM', message: 'Unknown error' };

      const wrappedError = ErrorFactory.createError(unknownError, '/api/test', {
        query: { filter: 'active' },
      });

      expect(wrappedError).toBeInstanceOf(InternalError);
      expect(wrappedError.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(wrappedError.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
      expect(wrappedError.errorName).toBe(ErrorName[ErrorCode.INTERNAL_ERROR]);
      expect(wrappedError.path).toBe('/api/test');
      expect(wrappedError.data).toEqual({
        query: { filter: 'active' },
      });
      expect(wrappedError.message).toContain('Unknown error');
      expect(wrappedError.message).toContain('[object Object]');
    });

    it('should wrap string error in InternalError', () => {
      const stringError = 'String error message';

      const wrappedError = ErrorFactory.createError(stringError);

      expect(wrappedError).toBeInstanceOf(InternalError);
      expect(wrappedError.message).toContain('Unknown error');
      expect(wrappedError.message).toContain('String error message');
    });

    it('should wrap null error in InternalError', () => {
      const nullError = null;

      const wrappedError = ErrorFactory.createError(nullError);

      expect(wrappedError).toBeInstanceOf(InternalError);
      expect(wrappedError.message).toContain('Unknown error');
      expect(wrappedError.message).toContain('null');
    });

    it('should wrap undefined error in InternalError', () => {
      const undefinedError = undefined;

      const wrappedError = ErrorFactory.createError(undefinedError);

      expect(wrappedError).toBeInstanceOf(InternalError);
      expect(wrappedError.message).toContain('Unknown error');
      expect(wrappedError.message).toContain('undefined');
    });

    it('should preserve original error when wrapping Error instance', () => {
      const regularError = new Error('Original error');
      regularError.name = 'TypeError';

      const wrappedError = ErrorFactory.createError(regularError) as InternalError;

      expect(wrappedError.cause).toBe(regularError);
    });
  });
});


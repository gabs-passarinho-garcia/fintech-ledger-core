import { t, Static } from 'elysia';
import { ErrorCode, ErrorName, HTTPStatusCode } from '../enums';

export const ErrorSchema = t.Object({
  statusCode: t.Enum(HTTPStatusCode),
  errorCode: t.Enum(ErrorCode),
  errorName: t.Enum(ErrorName),
  message: t.String(),
  path: t.Optional(t.String()),
  correlationId: t.Optional(t.String()),
});

export type ErrorDto = Static<typeof ErrorSchema>;

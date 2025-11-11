export const ErrorCode = {
  // 0 - 99: Database errors
  DB_CONNECTION_ERROR: 1,
  DB_QUERY_ERROR: 2,
  DB_INSERT_ERROR: 3,
  DB_UPDATE_ERROR: 4,
  DB_DELETE_ERROR: 5,
  // 400 - 499: Application errors
  INVALID_INPUT: 400,
  NOT_SIGNED: 401,
  NOT_AUTHORIZED: 403,
  NOT_FOUND: 404,
  OPERATION_NOT_ALLOWED: 405,
  ALREADY_EXISTS: 406,
  // 500 - 599: External source errors
  EXTERNAL_SOURCE_ERROR: 500,
  // 600 - 699: Domain/Business rule errors
  DOMAIN_ERROR: 600,
  INSUFFICIENT_BALANCE: 601,
  INVALID_TRANSACTION: 602,
  // 900 - 999: General errors
  INTERNAL_ERROR: 900,
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ErrorName = {
  [ErrorCode.DB_CONNECTION_ERROR]: 'DB_CONNECTION_ERROR',
  [ErrorCode.DB_QUERY_ERROR]: 'DB_QUERY_ERROR',
  [ErrorCode.DB_INSERT_ERROR]: 'DB_INSERT_ERROR',
  [ErrorCode.DB_UPDATE_ERROR]: 'DB_UPDATE_ERROR',
  [ErrorCode.DB_DELETE_ERROR]: 'DB_DELETE_ERROR',
  [ErrorCode.NOT_FOUND]: 'NOT_FOUND',
  [ErrorCode.INTERNAL_ERROR]: 'INTERNAL_ERROR',
  [ErrorCode.NOT_SIGNED]: 'NOT_SIGNED',
  [ErrorCode.NOT_AUTHORIZED]: 'NOT_AUTHORIZED',
  [ErrorCode.INVALID_INPUT]: 'INVALID_INPUT',
  [ErrorCode.EXTERNAL_SOURCE_ERROR]: 'EXTERNAL_SOURCE_ERROR',
  [ErrorCode.OPERATION_NOT_ALLOWED]: 'OPERATION_NOT_ALLOWED',
  [ErrorCode.ALREADY_EXISTS]: 'ALREADY_EXISTS',
  [ErrorCode.DOMAIN_ERROR]: 'DOMAIN_ERROR',
  [ErrorCode.INSUFFICIENT_BALANCE]: 'INSUFFICIENT_BALANCE',
  [ErrorCode.INVALID_TRANSACTION]: 'INVALID_TRANSACTION',
} as const;

export type ErrorName = (typeof ErrorName)[keyof typeof ErrorName];

export const ErrorMessage = {
  [ErrorCode.DB_CONNECTION_ERROR]: 'Database connection error',
  [ErrorCode.DB_QUERY_ERROR]: 'Database query error',
  [ErrorCode.DB_INSERT_ERROR]: 'Database insert error',
  [ErrorCode.DB_UPDATE_ERROR]: 'Database update error',
  [ErrorCode.DB_DELETE_ERROR]: 'Database delete error',
  [ErrorCode.NOT_FOUND]: 'Not found',
  [ErrorCode.INTERNAL_ERROR]: 'Internal error',
  [ErrorCode.NOT_SIGNED]: 'Not signed',
  [ErrorCode.NOT_AUTHORIZED]: 'Not authorized',
  [ErrorCode.INVALID_INPUT]: 'Invalid input',
  [ErrorCode.EXTERNAL_SOURCE_ERROR]: 'External source error',
  [ErrorCode.OPERATION_NOT_ALLOWED]: 'Operation not allowed',
  [ErrorCode.ALREADY_EXISTS]: 'Already exists',
  [ErrorCode.DOMAIN_ERROR]: 'Domain rule violation',
  [ErrorCode.INSUFFICIENT_BALANCE]: 'Insufficient balance',
  [ErrorCode.INVALID_TRANSACTION]: 'Invalid transaction',
} as const;

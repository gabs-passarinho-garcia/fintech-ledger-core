import { Elysia } from "elysia";
import { ContainerHandler } from "backend/common/container/ContainerHandler";
declare function buildApp(): Elysia<
  "",
  {
    decorator: {
      [x: string]: unknown;
    };
    store: {
      [x: string]: unknown;
    };
    derive: {
      [x: string]: unknown;
    };
    resolve: {
      [x: string]: unknown;
      scope: ContainerHandler;
    };
  },
  {
    typebox: {};
    error: {};
  },
  {
    schema: {};
    standaloneSchema: {};
    macro: {
      readonly isSignIn?: boolean | undefined;
    };
    macroFn: {
      readonly isSignIn: (enable: boolean) =>
        | {
            readonly beforeHandle: ({
              headers,
              scope,
              error,
            }: {
              [x: string]: unknown;
              body: unknown;
              query: Record<string, string>;
              params: {};
              headers: Record<string, string | undefined>;
              cookie: Record<string, import("elysia").Cookie<unknown>>;
              server: import("elysia/universal/server").Server | null;
              redirect: import("elysia").redirect;
              set: {
                headers: import("elysia").HTTPHeaders;
                status?: number | keyof import("elysia").StatusMap;
                redirect?: string;
                cookie?: Record<string, import("elysia/cookies").ElysiaCookie>;
              };
              path: string;
              route: string;
              request: Request;
              store: Record<string, unknown>;
              status: <
                const Code extends number | keyof import("elysia").StatusMap,
                const T = Code extends
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504
                  | 406
                  | 100
                  | 101
                  | 102
                  | 103
                  | 203
                  | 205
                  | 206
                  | 207
                  | 208
                  | 300
                  | 301
                  | 302
                  | 303
                  | 304
                  | 307
                  | 308
                  | 402
                  | 407
                  | 408
                  | 410
                  | 411
                  | 412
                  | 413
                  | 414
                  | 415
                  | 416
                  | 417
                  | 418
                  | 420
                  | 421
                  | 423
                  | 424
                  | 425
                  | 426
                  | 428
                  | 431
                  | 451
                  | 501
                  | 502
                  | 505
                  | 506
                  | 507
                  | 508
                  | 510
                  | 511
                  ? {
                      readonly 100: "Continue";
                      readonly 101: "Switching Protocols";
                      readonly 102: "Processing";
                      readonly 103: "Early Hints";
                      readonly 200: "OK";
                      readonly 201: "Created";
                      readonly 202: "Accepted";
                      readonly 203: "Non-Authoritative Information";
                      readonly 204: "No Content";
                      readonly 205: "Reset Content";
                      readonly 206: "Partial Content";
                      readonly 207: "Multi-Status";
                      readonly 208: "Already Reported";
                      readonly 300: "Multiple Choices";
                      readonly 301: "Moved Permanently";
                      readonly 302: "Found";
                      readonly 303: "See Other";
                      readonly 304: "Not Modified";
                      readonly 307: "Temporary Redirect";
                      readonly 308: "Permanent Redirect";
                      readonly 400: "Bad Request";
                      readonly 401: "Unauthorized";
                      readonly 402: "Payment Required";
                      readonly 403: "Forbidden";
                      readonly 404: "Not Found";
                      readonly 405: "Method Not Allowed";
                      readonly 406: "Not Acceptable";
                      readonly 407: "Proxy Authentication Required";
                      readonly 408: "Request Timeout";
                      readonly 409: "Conflict";
                      readonly 410: "Gone";
                      readonly 411: "Length Required";
                      readonly 412: "Precondition Failed";
                      readonly 413: "Payload Too Large";
                      readonly 414: "URI Too Long";
                      readonly 415: "Unsupported Media Type";
                      readonly 416: "Range Not Satisfiable";
                      readonly 417: "Expectation Failed";
                      readonly 418: "I'm a teapot";
                      readonly 420: "Enhance Your Calm";
                      readonly 421: "Misdirected Request";
                      readonly 422: "Unprocessable Content";
                      readonly 423: "Locked";
                      readonly 424: "Failed Dependency";
                      readonly 425: "Too Early";
                      readonly 426: "Upgrade Required";
                      readonly 428: "Precondition Required";
                      readonly 429: "Too Many Requests";
                      readonly 431: "Request Header Fields Too Large";
                      readonly 451: "Unavailable For Legal Reasons";
                      readonly 500: "Internal Server Error";
                      readonly 501: "Not Implemented";
                      readonly 502: "Bad Gateway";
                      readonly 503: "Service Unavailable";
                      readonly 504: "Gateway Timeout";
                      readonly 505: "HTTP Version Not Supported";
                      readonly 506: "Variant Also Negotiates";
                      readonly 507: "Insufficient Storage";
                      readonly 508: "Loop Detected";
                      readonly 510: "Not Extended";
                      readonly 511: "Network Authentication Required";
                    }[Code]
                  : Code,
              >(
                code: Code,
                response?: T,
              ) => import("elysia").ElysiaCustomStatusResponse<
                Code,
                T,
                Code extends
                  | "Continue"
                  | "Switching Protocols"
                  | "Processing"
                  | "Early Hints"
                  | "OK"
                  | "Created"
                  | "Accepted"
                  | "Non-Authoritative Information"
                  | "No Content"
                  | "Reset Content"
                  | "Partial Content"
                  | "Multi-Status"
                  | "Already Reported"
                  | "Multiple Choices"
                  | "Moved Permanently"
                  | "Found"
                  | "See Other"
                  | "Not Modified"
                  | "Temporary Redirect"
                  | "Permanent Redirect"
                  | "Bad Request"
                  | "Unauthorized"
                  | "Payment Required"
                  | "Forbidden"
                  | "Not Found"
                  | "Method Not Allowed"
                  | "Not Acceptable"
                  | "Proxy Authentication Required"
                  | "Request Timeout"
                  | "Conflict"
                  | "Gone"
                  | "Length Required"
                  | "Precondition Failed"
                  | "Payload Too Large"
                  | "URI Too Long"
                  | "Unsupported Media Type"
                  | "Range Not Satisfiable"
                  | "Expectation Failed"
                  | "I'm a teapot"
                  | "Enhance Your Calm"
                  | "Misdirected Request"
                  | "Unprocessable Content"
                  | "Locked"
                  | "Failed Dependency"
                  | "Too Early"
                  | "Upgrade Required"
                  | "Precondition Required"
                  | "Too Many Requests"
                  | "Request Header Fields Too Large"
                  | "Unavailable For Legal Reasons"
                  | "Internal Server Error"
                  | "Not Implemented"
                  | "Bad Gateway"
                  | "Service Unavailable"
                  | "Gateway Timeout"
                  | "HTTP Version Not Supported"
                  | "Variant Also Negotiates"
                  | "Insufficient Storage"
                  | "Loop Detected"
                  | "Not Extended"
                  | "Network Authentication Required"
                  ? {
                      readonly Continue: 100;
                      readonly "Switching Protocols": 101;
                      readonly Processing: 102;
                      readonly "Early Hints": 103;
                      readonly OK: 200;
                      readonly Created: 201;
                      readonly Accepted: 202;
                      readonly "Non-Authoritative Information": 203;
                      readonly "No Content": 204;
                      readonly "Reset Content": 205;
                      readonly "Partial Content": 206;
                      readonly "Multi-Status": 207;
                      readonly "Already Reported": 208;
                      readonly "Multiple Choices": 300;
                      readonly "Moved Permanently": 301;
                      readonly Found: 302;
                      readonly "See Other": 303;
                      readonly "Not Modified": 304;
                      readonly "Temporary Redirect": 307;
                      readonly "Permanent Redirect": 308;
                      readonly "Bad Request": 400;
                      readonly Unauthorized: 401;
                      readonly "Payment Required": 402;
                      readonly Forbidden: 403;
                      readonly "Not Found": 404;
                      readonly "Method Not Allowed": 405;
                      readonly "Not Acceptable": 406;
                      readonly "Proxy Authentication Required": 407;
                      readonly "Request Timeout": 408;
                      readonly Conflict: 409;
                      readonly Gone: 410;
                      readonly "Length Required": 411;
                      readonly "Precondition Failed": 412;
                      readonly "Payload Too Large": 413;
                      readonly "URI Too Long": 414;
                      readonly "Unsupported Media Type": 415;
                      readonly "Range Not Satisfiable": 416;
                      readonly "Expectation Failed": 417;
                      readonly "I'm a teapot": 418;
                      readonly "Enhance Your Calm": 420;
                      readonly "Misdirected Request": 421;
                      readonly "Unprocessable Content": 422;
                      readonly Locked: 423;
                      readonly "Failed Dependency": 424;
                      readonly "Too Early": 425;
                      readonly "Upgrade Required": 426;
                      readonly "Precondition Required": 428;
                      readonly "Too Many Requests": 429;
                      readonly "Request Header Fields Too Large": 431;
                      readonly "Unavailable For Legal Reasons": 451;
                      readonly "Internal Server Error": 500;
                      readonly "Not Implemented": 501;
                      readonly "Bad Gateway": 502;
                      readonly "Service Unavailable": 503;
                      readonly "Gateway Timeout": 504;
                      readonly "HTTP Version Not Supported": 505;
                      readonly "Variant Also Negotiates": 506;
                      readonly "Insufficient Storage": 507;
                      readonly "Loop Detected": 508;
                      readonly "Not Extended": 510;
                      readonly "Network Authentication Required": 511;
                    }[Code]
                  : Code
              >;
              scope: ContainerHandler;
            }) => Promise<void>;
          }
        | undefined;
    };
    parser: {};
    response: {};
  },
  {
    get: {
      body: unknown;
      params: {};
      query: unknown;
      headers: unknown;
      response: {
        200:
          | Response
          | {
              message: string;
              version: string;
              documentation: string;
            };
      };
    };
  } & {
    health: {
      get: {
        body: unknown;
        params: {};
        query: unknown;
        headers: unknown;
        response: {
          200:
            | Response
            | {
                status: string;
                timestamp: string;
                service: string;
              };
        };
      };
    };
  } & {
    auth: {
      login: {
        post: {
          body: {
            username: string;
            password: string;
          };
          params: {};
          query: unknown;
          headers: unknown;
          response: {
            200: {
              statusCode: 200;
              data: {
                refreshToken?: string | undefined;
                accessToken?: string | undefined;
                expiresIn?: number | undefined;
                tokenType?: string | undefined;
                userEmail?: string | undefined;
                status: string;
                username: string;
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    auth: {
      refresh: {
        post: {
          body: {
            refreshToken: string;
            username: string;
          };
          params: {};
          query: unknown;
          headers: unknown;
          response: {
            200: {
              statusCode: 200;
              data: {
                refreshToken?: string | undefined;
                accessToken?: string | undefined;
                expiresIn?: number | undefined;
                tokenType?: string | undefined;
                userEmail?: string | undefined;
                status: string;
                username: string;
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {
      signup: {
        post: {
          body: {
            tenantId?: string | undefined;
            firstName: string;
            lastName: string;
            email: string;
            username: string;
            password: string;
          };
          params: {};
          query: unknown;
          headers: unknown;
          response: {
            200: {
              statusCode: 201;
              data: {
                profile?:
                  | {
                      userId: string;
                      tenantId: string;
                      id: string;
                      createdAt: Date;
                      firstName: string;
                      lastName: string;
                      email: string;
                    }
                  | undefined;
                user: {
                  id: string;
                  createdAt: Date;
                  username: string;
                };
              };
            };
            201: {
              statusCode: 201;
              data: {
                profile?:
                  | {
                      userId: string;
                      tenantId: string;
                      id: string;
                      createdAt: Date;
                      firstName: string;
                      lastName: string;
                      email: string;
                    }
                  | undefined;
                user: {
                  id: string;
                  createdAt: Date;
                  username: string;
                };
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {};
  } & {
    users: {
      profiles: {
        me: {
          get: {
            body: {};
            params: {};
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  userId: string;
                  tenantId: string;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  firstName: string;
                  lastName: string;
                  email: string;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        ":profileId": {
          get: {
            body: {};
            params: {
              profileId: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  userId: string;
                  tenantId: string;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  firstName: string;
                  lastName: string;
                  email: string;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        ":profileId": {
          put: {
            body: {
              firstName?: string | undefined;
              lastName?: string | undefined;
              email?: string | undefined;
            };
            params: {
              profileId: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  userId: string;
                  tenantId: string;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  firstName: string;
                  lastName: string;
                  email: string;
                };
              };
              400: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        get: {
          body: {};
          params: {};
          query: {};
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                profiles: {
                  userId: string;
                  tenantId: string;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  firstName: string;
                  lastName: string;
                  email: string;
                }[];
              };
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        post: {
          body: {
            tenantId: string;
            firstName: string;
            lastName: string;
            email: string;
          };
          params: {};
          query: {};
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 201;
              data: {
                userId: string;
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
              };
            };
            201: {
              statusCode: 201;
              data: {
                userId: string;
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {
      all: {
        get: {
          body: {};
          params: {};
          query: {
            take?: number | undefined;
            skip?: number | undefined;
            includeDeleted?: boolean | undefined;
          };
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                users: {
                  deletedAt?: Date | null | undefined;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  profiles: {
                    deletedAt?: Date | null | undefined;
                    userId: string;
                    tenantId: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    firstName: string;
                    lastName: string;
                    email: string;
                  }[];
                  username: string;
                  isMaster: boolean;
                }[];
              };
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            403: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {
      all: {
        profiles: {
          get: {
            body: {};
            params: {};
            query: {
              take?: number | undefined;
              skip?: number | undefined;
              includeDeleted?: boolean | undefined;
            };
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  profiles: {
                    deletedAt?: Date | null | undefined;
                    user: {
                      deletedAt?: Date | null | undefined;
                      id: string;
                      createdAt: Date;
                      updatedAt: Date;
                      username: string;
                      isMaster: boolean;
                    };
                    userId: string;
                    tenantId: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    firstName: string;
                    lastName: string;
                    email: string;
                  }[];
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        ":profileId": {
          delete: {
            body: {};
            params: {
              profileId: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  success: boolean;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      me: {
        delete: {
          body: {};
          params: {};
          query: {};
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                success: boolean;
              };
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            403: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    ledger: {};
  } & {
    ledger: {
      entries: {
        post: {
          body: {
            fromAccountId?: string | null | undefined;
            toAccountId?: string | null | undefined;
            tenantId: string;
            type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
            createdBy: string;
            amount: string | number;
          };
          params: {};
          query: {};
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 201;
              data: import("./models/ledger/usecases/CreateLedgerEntry.usecase").CreateLedgerEntryOutput;
            };
            201: {
              statusCode: 201;
              data: {
                fromAccountId?: string | null | undefined;
                toAccountId?: string | null | undefined;
                tenantId: string;
                type: string;
                id: string;
                createdAt: Date;
                amount: string;
                status: string;
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        get: {
          body: {};
          params: {};
          query: {
            type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | undefined;
            status?: "PENDING" | "COMPLETED" | "FAILED" | undefined;
            page?: number | undefined;
            limit?: number | undefined;
            dateFrom?: Date | undefined;
            dateTo?: Date | undefined;
          };
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                entries: {
                  updatedBy?: string | null | undefined;
                  fromAccountId?: string | null | undefined;
                  toAccountId?: string | null | undefined;
                  tenantId: string;
                  type: string;
                  id: string;
                  createdBy: string;
                  createdAt: Date;
                  updatedAt: Date;
                  amount: string;
                  status: string;
                }[];
                pagination: {
                  total: number;
                  page: number;
                  limit: number;
                  totalPages: number;
                };
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        ":id": {
          get: {
            body: {};
            params: {
              id: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  updatedBy?: string | null | undefined;
                  fromAccountId?: string | null | undefined;
                  toAccountId?: string | null | undefined;
                  tenantId: string;
                  type: string;
                  id: string;
                  createdBy: string;
                  createdAt: Date;
                  updatedAt: Date;
                  amount: string;
                  status: string;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        ":id": {
          put: {
            body: {
              status: "PENDING" | "COMPLETED" | "FAILED";
            };
            params: {
              id: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  updatedBy?: string | null | undefined;
                  fromAccountId?: string | null | undefined;
                  toAccountId?: string | null | undefined;
                  tenantId: string;
                  type: string;
                  id: string;
                  createdBy: string;
                  createdAt: Date;
                  updatedAt: Date;
                  amount: string;
                  status: string;
                };
              };
              400: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        all: {
          get: {
            body: {};
            params: {};
            query: {
              tenantId?: string | undefined;
              type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | undefined;
              status?: "PENDING" | "COMPLETED" | "FAILED" | undefined;
              page?: number | undefined;
              limit?: number | undefined;
              dateFrom?: Date | undefined;
              dateTo?: Date | undefined;
              includeDeleted?: boolean | undefined;
            };
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  entries: {
                    updatedBy?: string | null | undefined;
                    deletedBy?: string | null | undefined;
                    deletedAt?: Date | null | undefined;
                    fromAccountId?: string | null | undefined;
                    toAccountId?: string | null | undefined;
                    tenantId: string;
                    type: string;
                    id: string;
                    createdBy: string;
                    createdAt: Date;
                    updatedAt: Date;
                    amount: string;
                    status: string;
                  }[];
                  pagination: {
                    total: number;
                    page: number;
                    limit: number;
                    totalPages: number;
                  };
                };
              };
              400: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        ":id": {
          delete: {
            body: {};
            params: {
              id: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  id: string;
                  deletedBy: string;
                  deletedAt: Date;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    tenants: {
      public: {
        get: {
          body: unknown;
          params: {};
          query: unknown;
          headers: unknown;
          response: {
            200: {
              statusCode: 200;
              data: {
                tenants: {
                  name: string;
                  id: string;
                }[];
              };
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    tenants: {};
  } & {
    tenants: {
      get: {
        body: {};
        params: {};
        query: {};
        headers: {
          "x-tenant-id"?: string | undefined;
          "x-correlation-id"?: string | undefined;
          authorization: string;
        };
        response: {
          200: {
            statusCode: 200;
            data: {
              tenants: {
                updatedBy?: string | null | undefined;
                deletedBy?: string | null | undefined;
                deletedAt?: Date | null | undefined;
                name: string;
                id: string;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
              }[];
            };
          };
          401: {
            correlationId?: string | undefined;
            path?: string | undefined;
            message: string;
            statusCode:
              | 200
              | 201
              | 202
              | 204
              | 400
              | 401
              | 403
              | 404
              | 405
              | 409
              | 422
              | 429
              | 500
              | 503
              | 504;
            errorCode:
              | 5
              | 1
              | 2
              | 400
              | 401
              | 403
              | 404
              | 405
              | 500
              | 3
              | 4
              | 406
              | 600
              | 601
              | 602
              | 603
              | 900;
            errorName:
              | "NOT_FOUND"
              | "DB_CONNECTION_ERROR"
              | "DB_QUERY_ERROR"
              | "DB_INSERT_ERROR"
              | "DB_UPDATE_ERROR"
              | "DB_DELETE_ERROR"
              | "INVALID_INPUT"
              | "NOT_SIGNED"
              | "NOT_AUTHORIZED"
              | "OPERATION_NOT_ALLOWED"
              | "ALREADY_EXISTS"
              | "EXTERNAL_SOURCE_ERROR"
              | "DOMAIN_ERROR"
              | "INSUFFICIENT_BALANCE"
              | "INVALID_TRANSACTION"
              | "UNSUPPORTED_PAYMENT_PROVIDER"
              | "INTERNAL_ERROR";
          };
          422: {
            type: "validation";
            on: string;
            summary?: string;
            message?: string;
            found?: unknown;
            property?: string;
            expected?: string;
          };
          500: {
            correlationId?: string | undefined;
            path?: string | undefined;
            message: string;
            statusCode:
              | 200
              | 201
              | 202
              | 204
              | 400
              | 401
              | 403
              | 404
              | 405
              | 409
              | 422
              | 429
              | 500
              | 503
              | 504;
            errorCode:
              | 5
              | 1
              | 2
              | 400
              | 401
              | 403
              | 404
              | 405
              | 500
              | 3
              | 4
              | 406
              | 600
              | 601
              | 602
              | 603
              | 900;
            errorName:
              | "NOT_FOUND"
              | "DB_CONNECTION_ERROR"
              | "DB_QUERY_ERROR"
              | "DB_INSERT_ERROR"
              | "DB_UPDATE_ERROR"
              | "DB_DELETE_ERROR"
              | "INVALID_INPUT"
              | "NOT_SIGNED"
              | "NOT_AUTHORIZED"
              | "OPERATION_NOT_ALLOWED"
              | "ALREADY_EXISTS"
              | "EXTERNAL_SOURCE_ERROR"
              | "DOMAIN_ERROR"
              | "INSUFFICIENT_BALANCE"
              | "INVALID_TRANSACTION"
              | "UNSUPPORTED_PAYMENT_PROVIDER"
              | "INTERNAL_ERROR";
          };
        };
      };
    };
  } & {
    tenants: {
      all: {
        get: {
          body: {};
          params: {};
          query: {
            take?: number | undefined;
            skip?: number | undefined;
            includeDeleted?: boolean | undefined;
          };
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                tenants: {
                  updatedBy?: string | null | undefined;
                  deletedBy?: string | null | undefined;
                  deletedAt?: Date | null | undefined;
                  name: string;
                  id: string;
                  createdBy: string;
                  createdAt: Date;
                  updatedAt: Date;
                }[];
              };
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            403: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  },
  {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
  },
  {
    derive: {};
    resolve: {
      scope: ContainerHandler;
    };
    schema: {};
    standaloneSchema: {};
    response: {
      200: Response;
    };
  }
>;
export declare const app: Elysia<
  "",
  {
    decorator: {
      [x: string]: unknown;
    };
    store: {
      [x: string]: unknown;
    };
    derive: {
      [x: string]: unknown;
    };
    resolve: {
      [x: string]: unknown;
      scope: ContainerHandler;
    };
  },
  {
    typebox: {};
    error: {};
  },
  {
    schema: {};
    standaloneSchema: {};
    macro: {
      readonly isSignIn?: boolean | undefined;
    };
    macroFn: {
      readonly isSignIn: (enable: boolean) =>
        | {
            readonly beforeHandle: ({
              headers,
              scope,
              error,
            }: {
              [x: string]: unknown;
              body: unknown;
              query: Record<string, string>;
              params: {};
              headers: Record<string, string | undefined>;
              cookie: Record<string, import("elysia").Cookie<unknown>>;
              server: import("elysia/universal/server").Server | null;
              redirect: import("elysia").redirect;
              set: {
                headers: import("elysia").HTTPHeaders;
                status?: number | keyof import("elysia").StatusMap;
                redirect?: string;
                cookie?: Record<string, import("elysia/cookies").ElysiaCookie>;
              };
              path: string;
              route: string;
              request: Request;
              store: Record<string, unknown>;
              status: <
                const Code extends number | keyof import("elysia").StatusMap,
                const T = Code extends
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504
                  | 406
                  | 100
                  | 101
                  | 102
                  | 103
                  | 203
                  | 205
                  | 206
                  | 207
                  | 208
                  | 300
                  | 301
                  | 302
                  | 303
                  | 304
                  | 307
                  | 308
                  | 402
                  | 407
                  | 408
                  | 410
                  | 411
                  | 412
                  | 413
                  | 414
                  | 415
                  | 416
                  | 417
                  | 418
                  | 420
                  | 421
                  | 423
                  | 424
                  | 425
                  | 426
                  | 428
                  | 431
                  | 451
                  | 501
                  | 502
                  | 505
                  | 506
                  | 507
                  | 508
                  | 510
                  | 511
                  ? {
                      readonly 100: "Continue";
                      readonly 101: "Switching Protocols";
                      readonly 102: "Processing";
                      readonly 103: "Early Hints";
                      readonly 200: "OK";
                      readonly 201: "Created";
                      readonly 202: "Accepted";
                      readonly 203: "Non-Authoritative Information";
                      readonly 204: "No Content";
                      readonly 205: "Reset Content";
                      readonly 206: "Partial Content";
                      readonly 207: "Multi-Status";
                      readonly 208: "Already Reported";
                      readonly 300: "Multiple Choices";
                      readonly 301: "Moved Permanently";
                      readonly 302: "Found";
                      readonly 303: "See Other";
                      readonly 304: "Not Modified";
                      readonly 307: "Temporary Redirect";
                      readonly 308: "Permanent Redirect";
                      readonly 400: "Bad Request";
                      readonly 401: "Unauthorized";
                      readonly 402: "Payment Required";
                      readonly 403: "Forbidden";
                      readonly 404: "Not Found";
                      readonly 405: "Method Not Allowed";
                      readonly 406: "Not Acceptable";
                      readonly 407: "Proxy Authentication Required";
                      readonly 408: "Request Timeout";
                      readonly 409: "Conflict";
                      readonly 410: "Gone";
                      readonly 411: "Length Required";
                      readonly 412: "Precondition Failed";
                      readonly 413: "Payload Too Large";
                      readonly 414: "URI Too Long";
                      readonly 415: "Unsupported Media Type";
                      readonly 416: "Range Not Satisfiable";
                      readonly 417: "Expectation Failed";
                      readonly 418: "I'm a teapot";
                      readonly 420: "Enhance Your Calm";
                      readonly 421: "Misdirected Request";
                      readonly 422: "Unprocessable Content";
                      readonly 423: "Locked";
                      readonly 424: "Failed Dependency";
                      readonly 425: "Too Early";
                      readonly 426: "Upgrade Required";
                      readonly 428: "Precondition Required";
                      readonly 429: "Too Many Requests";
                      readonly 431: "Request Header Fields Too Large";
                      readonly 451: "Unavailable For Legal Reasons";
                      readonly 500: "Internal Server Error";
                      readonly 501: "Not Implemented";
                      readonly 502: "Bad Gateway";
                      readonly 503: "Service Unavailable";
                      readonly 504: "Gateway Timeout";
                      readonly 505: "HTTP Version Not Supported";
                      readonly 506: "Variant Also Negotiates";
                      readonly 507: "Insufficient Storage";
                      readonly 508: "Loop Detected";
                      readonly 510: "Not Extended";
                      readonly 511: "Network Authentication Required";
                    }[Code]
                  : Code,
              >(
                code: Code,
                response?: T,
              ) => import("elysia").ElysiaCustomStatusResponse<
                Code,
                T,
                Code extends
                  | "Continue"
                  | "Switching Protocols"
                  | "Processing"
                  | "Early Hints"
                  | "OK"
                  | "Created"
                  | "Accepted"
                  | "Non-Authoritative Information"
                  | "No Content"
                  | "Reset Content"
                  | "Partial Content"
                  | "Multi-Status"
                  | "Already Reported"
                  | "Multiple Choices"
                  | "Moved Permanently"
                  | "Found"
                  | "See Other"
                  | "Not Modified"
                  | "Temporary Redirect"
                  | "Permanent Redirect"
                  | "Bad Request"
                  | "Unauthorized"
                  | "Payment Required"
                  | "Forbidden"
                  | "Not Found"
                  | "Method Not Allowed"
                  | "Not Acceptable"
                  | "Proxy Authentication Required"
                  | "Request Timeout"
                  | "Conflict"
                  | "Gone"
                  | "Length Required"
                  | "Precondition Failed"
                  | "Payload Too Large"
                  | "URI Too Long"
                  | "Unsupported Media Type"
                  | "Range Not Satisfiable"
                  | "Expectation Failed"
                  | "I'm a teapot"
                  | "Enhance Your Calm"
                  | "Misdirected Request"
                  | "Unprocessable Content"
                  | "Locked"
                  | "Failed Dependency"
                  | "Too Early"
                  | "Upgrade Required"
                  | "Precondition Required"
                  | "Too Many Requests"
                  | "Request Header Fields Too Large"
                  | "Unavailable For Legal Reasons"
                  | "Internal Server Error"
                  | "Not Implemented"
                  | "Bad Gateway"
                  | "Service Unavailable"
                  | "Gateway Timeout"
                  | "HTTP Version Not Supported"
                  | "Variant Also Negotiates"
                  | "Insufficient Storage"
                  | "Loop Detected"
                  | "Not Extended"
                  | "Network Authentication Required"
                  ? {
                      readonly Continue: 100;
                      readonly "Switching Protocols": 101;
                      readonly Processing: 102;
                      readonly "Early Hints": 103;
                      readonly OK: 200;
                      readonly Created: 201;
                      readonly Accepted: 202;
                      readonly "Non-Authoritative Information": 203;
                      readonly "No Content": 204;
                      readonly "Reset Content": 205;
                      readonly "Partial Content": 206;
                      readonly "Multi-Status": 207;
                      readonly "Already Reported": 208;
                      readonly "Multiple Choices": 300;
                      readonly "Moved Permanently": 301;
                      readonly Found: 302;
                      readonly "See Other": 303;
                      readonly "Not Modified": 304;
                      readonly "Temporary Redirect": 307;
                      readonly "Permanent Redirect": 308;
                      readonly "Bad Request": 400;
                      readonly Unauthorized: 401;
                      readonly "Payment Required": 402;
                      readonly Forbidden: 403;
                      readonly "Not Found": 404;
                      readonly "Method Not Allowed": 405;
                      readonly "Not Acceptable": 406;
                      readonly "Proxy Authentication Required": 407;
                      readonly "Request Timeout": 408;
                      readonly Conflict: 409;
                      readonly Gone: 410;
                      readonly "Length Required": 411;
                      readonly "Precondition Failed": 412;
                      readonly "Payload Too Large": 413;
                      readonly "URI Too Long": 414;
                      readonly "Unsupported Media Type": 415;
                      readonly "Range Not Satisfiable": 416;
                      readonly "Expectation Failed": 417;
                      readonly "I'm a teapot": 418;
                      readonly "Enhance Your Calm": 420;
                      readonly "Misdirected Request": 421;
                      readonly "Unprocessable Content": 422;
                      readonly Locked: 423;
                      readonly "Failed Dependency": 424;
                      readonly "Too Early": 425;
                      readonly "Upgrade Required": 426;
                      readonly "Precondition Required": 428;
                      readonly "Too Many Requests": 429;
                      readonly "Request Header Fields Too Large": 431;
                      readonly "Unavailable For Legal Reasons": 451;
                      readonly "Internal Server Error": 500;
                      readonly "Not Implemented": 501;
                      readonly "Bad Gateway": 502;
                      readonly "Service Unavailable": 503;
                      readonly "Gateway Timeout": 504;
                      readonly "HTTP Version Not Supported": 505;
                      readonly "Variant Also Negotiates": 506;
                      readonly "Insufficient Storage": 507;
                      readonly "Loop Detected": 508;
                      readonly "Not Extended": 510;
                      readonly "Network Authentication Required": 511;
                    }[Code]
                  : Code
              >;
              scope: ContainerHandler;
            }) => Promise<void>;
          }
        | undefined;
    };
    parser: {};
    response: {};
  },
  {
    get: {
      body: unknown;
      params: {};
      query: unknown;
      headers: unknown;
      response: {
        200:
          | Response
          | {
              message: string;
              version: string;
              documentation: string;
            };
      };
    };
  } & {
    health: {
      get: {
        body: unknown;
        params: {};
        query: unknown;
        headers: unknown;
        response: {
          200:
            | Response
            | {
                status: string;
                timestamp: string;
                service: string;
              };
        };
      };
    };
  } & {
    auth: {
      login: {
        post: {
          body: {
            username: string;
            password: string;
          };
          params: {};
          query: unknown;
          headers: unknown;
          response: {
            200: {
              statusCode: 200;
              data: {
                refreshToken?: string | undefined;
                accessToken?: string | undefined;
                expiresIn?: number | undefined;
                tokenType?: string | undefined;
                userEmail?: string | undefined;
                status: string;
                username: string;
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    auth: {
      refresh: {
        post: {
          body: {
            refreshToken: string;
            username: string;
          };
          params: {};
          query: unknown;
          headers: unknown;
          response: {
            200: {
              statusCode: 200;
              data: {
                refreshToken?: string | undefined;
                accessToken?: string | undefined;
                expiresIn?: number | undefined;
                tokenType?: string | undefined;
                userEmail?: string | undefined;
                status: string;
                username: string;
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {
      signup: {
        post: {
          body: {
            tenantId?: string | undefined;
            firstName: string;
            lastName: string;
            email: string;
            username: string;
            password: string;
          };
          params: {};
          query: unknown;
          headers: unknown;
          response: {
            200: {
              statusCode: 201;
              data: {
                profile?:
                  | {
                      userId: string;
                      tenantId: string;
                      id: string;
                      createdAt: Date;
                      firstName: string;
                      lastName: string;
                      email: string;
                    }
                  | undefined;
                user: {
                  id: string;
                  createdAt: Date;
                  username: string;
                };
              };
            };
            201: {
              statusCode: 201;
              data: {
                profile?:
                  | {
                      userId: string;
                      tenantId: string;
                      id: string;
                      createdAt: Date;
                      firstName: string;
                      lastName: string;
                      email: string;
                    }
                  | undefined;
                user: {
                  id: string;
                  createdAt: Date;
                  username: string;
                };
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {};
  } & {
    users: {
      profiles: {
        me: {
          get: {
            body: {};
            params: {};
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  userId: string;
                  tenantId: string;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  firstName: string;
                  lastName: string;
                  email: string;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        ":profileId": {
          get: {
            body: {};
            params: {
              profileId: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  userId: string;
                  tenantId: string;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  firstName: string;
                  lastName: string;
                  email: string;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        ":profileId": {
          put: {
            body: {
              firstName?: string | undefined;
              lastName?: string | undefined;
              email?: string | undefined;
            };
            params: {
              profileId: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  userId: string;
                  tenantId: string;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  firstName: string;
                  lastName: string;
                  email: string;
                };
              };
              400: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        get: {
          body: {};
          params: {};
          query: {};
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                profiles: {
                  userId: string;
                  tenantId: string;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  firstName: string;
                  lastName: string;
                  email: string;
                }[];
              };
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        post: {
          body: {
            tenantId: string;
            firstName: string;
            lastName: string;
            email: string;
          };
          params: {};
          query: {};
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 201;
              data: {
                userId: string;
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
              };
            };
            201: {
              statusCode: 201;
              data: {
                userId: string;
                tenantId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {
      all: {
        get: {
          body: {};
          params: {};
          query: {
            take?: number | undefined;
            skip?: number | undefined;
            includeDeleted?: boolean | undefined;
          };
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                users: {
                  deletedAt?: Date | null | undefined;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  profiles: {
                    deletedAt?: Date | null | undefined;
                    userId: string;
                    tenantId: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    firstName: string;
                    lastName: string;
                    email: string;
                  }[];
                  username: string;
                  isMaster: boolean;
                }[];
              };
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            403: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    users: {
      all: {
        profiles: {
          get: {
            body: {};
            params: {};
            query: {
              take?: number | undefined;
              skip?: number | undefined;
              includeDeleted?: boolean | undefined;
            };
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  profiles: {
                    deletedAt?: Date | null | undefined;
                    user: {
                      deletedAt?: Date | null | undefined;
                      id: string;
                      createdAt: Date;
                      updatedAt: Date;
                      username: string;
                      isMaster: boolean;
                    };
                    userId: string;
                    tenantId: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    firstName: string;
                    lastName: string;
                    email: string;
                  }[];
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      profiles: {
        ":profileId": {
          delete: {
            body: {};
            params: {
              profileId: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  success: boolean;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    users: {
      me: {
        delete: {
          body: {};
          params: {};
          query: {};
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                success: boolean;
              };
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            403: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    ledger: {};
  } & {
    ledger: {
      entries: {
        post: {
          body: {
            fromAccountId?: string | null | undefined;
            toAccountId?: string | null | undefined;
            tenantId: string;
            type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
            createdBy: string;
            amount: string | number;
          };
          params: {};
          query: {};
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 201;
              data: import("./models/ledger/usecases/CreateLedgerEntry.usecase").CreateLedgerEntryOutput;
            };
            201: {
              statusCode: 201;
              data: {
                fromAccountId?: string | null | undefined;
                toAccountId?: string | null | undefined;
                tenantId: string;
                type: string;
                id: string;
                createdAt: Date;
                amount: string;
                status: string;
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            404: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        get: {
          body: {};
          params: {};
          query: {
            type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | undefined;
            status?: "PENDING" | "COMPLETED" | "FAILED" | undefined;
            page?: number | undefined;
            limit?: number | undefined;
            dateFrom?: Date | undefined;
            dateTo?: Date | undefined;
          };
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                entries: {
                  updatedBy?: string | null | undefined;
                  fromAccountId?: string | null | undefined;
                  toAccountId?: string | null | undefined;
                  tenantId: string;
                  type: string;
                  id: string;
                  createdBy: string;
                  createdAt: Date;
                  updatedAt: Date;
                  amount: string;
                  status: string;
                }[];
                pagination: {
                  total: number;
                  page: number;
                  limit: number;
                  totalPages: number;
                };
              };
            };
            400: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        ":id": {
          get: {
            body: {};
            params: {
              id: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  updatedBy?: string | null | undefined;
                  fromAccountId?: string | null | undefined;
                  toAccountId?: string | null | undefined;
                  tenantId: string;
                  type: string;
                  id: string;
                  createdBy: string;
                  createdAt: Date;
                  updatedAt: Date;
                  amount: string;
                  status: string;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        ":id": {
          put: {
            body: {
              status: "PENDING" | "COMPLETED" | "FAILED";
            };
            params: {
              id: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  updatedBy?: string | null | undefined;
                  fromAccountId?: string | null | undefined;
                  toAccountId?: string | null | undefined;
                  tenantId: string;
                  type: string;
                  id: string;
                  createdBy: string;
                  createdAt: Date;
                  updatedAt: Date;
                  amount: string;
                  status: string;
                };
              };
              400: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        all: {
          get: {
            body: {};
            params: {};
            query: {
              tenantId?: string | undefined;
              type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | undefined;
              status?: "PENDING" | "COMPLETED" | "FAILED" | undefined;
              page?: number | undefined;
              limit?: number | undefined;
              dateFrom?: Date | undefined;
              dateTo?: Date | undefined;
              includeDeleted?: boolean | undefined;
            };
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  entries: {
                    updatedBy?: string | null | undefined;
                    deletedBy?: string | null | undefined;
                    deletedAt?: Date | null | undefined;
                    fromAccountId?: string | null | undefined;
                    toAccountId?: string | null | undefined;
                    tenantId: string;
                    type: string;
                    id: string;
                    createdBy: string;
                    createdAt: Date;
                    updatedAt: Date;
                    amount: string;
                    status: string;
                  }[];
                  pagination: {
                    total: number;
                    page: number;
                    limit: number;
                    totalPages: number;
                  };
                };
              };
              400: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              403: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    ledger: {
      entries: {
        ":id": {
          delete: {
            body: {};
            params: {
              id: string;
            };
            query: {};
            headers: {
              "x-tenant-id"?: string | undefined;
              "x-correlation-id"?: string | undefined;
              authorization: string;
            };
            response: {
              200: {
                statusCode: 200;
                data: {
                  id: string;
                  deletedBy: string;
                  deletedAt: Date;
                };
              };
              401: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              404: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
              422: {
                type: "validation";
                on: string;
                summary?: string;
                message?: string;
                found?: unknown;
                property?: string;
                expected?: string;
              };
              500: {
                correlationId?: string | undefined;
                path?: string | undefined;
                message: string;
                statusCode:
                  | 200
                  | 201
                  | 202
                  | 204
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 409
                  | 422
                  | 429
                  | 500
                  | 503
                  | 504;
                errorCode:
                  | 5
                  | 1
                  | 2
                  | 400
                  | 401
                  | 403
                  | 404
                  | 405
                  | 500
                  | 3
                  | 4
                  | 406
                  | 600
                  | 601
                  | 602
                  | 603
                  | 900;
                errorName:
                  | "NOT_FOUND"
                  | "DB_CONNECTION_ERROR"
                  | "DB_QUERY_ERROR"
                  | "DB_INSERT_ERROR"
                  | "DB_UPDATE_ERROR"
                  | "DB_DELETE_ERROR"
                  | "INVALID_INPUT"
                  | "NOT_SIGNED"
                  | "NOT_AUTHORIZED"
                  | "OPERATION_NOT_ALLOWED"
                  | "ALREADY_EXISTS"
                  | "EXTERNAL_SOURCE_ERROR"
                  | "DOMAIN_ERROR"
                  | "INSUFFICIENT_BALANCE"
                  | "INVALID_TRANSACTION"
                  | "UNSUPPORTED_PAYMENT_PROVIDER"
                  | "INTERNAL_ERROR";
              };
            };
          };
        };
      };
    };
  } & {
    tenants: {
      public: {
        get: {
          body: unknown;
          params: {};
          query: unknown;
          headers: unknown;
          response: {
            200: {
              statusCode: 200;
              data: {
                tenants: {
                  name: string;
                  id: string;
                }[];
              };
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  } & {
    tenants: {};
  } & {
    tenants: {
      get: {
        body: {};
        params: {};
        query: {};
        headers: {
          "x-tenant-id"?: string | undefined;
          "x-correlation-id"?: string | undefined;
          authorization: string;
        };
        response: {
          200: {
            statusCode: 200;
            data: {
              tenants: {
                updatedBy?: string | null | undefined;
                deletedBy?: string | null | undefined;
                deletedAt?: Date | null | undefined;
                name: string;
                id: string;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
              }[];
            };
          };
          401: {
            correlationId?: string | undefined;
            path?: string | undefined;
            message: string;
            statusCode:
              | 200
              | 201
              | 202
              | 204
              | 400
              | 401
              | 403
              | 404
              | 405
              | 409
              | 422
              | 429
              | 500
              | 503
              | 504;
            errorCode:
              | 5
              | 1
              | 2
              | 400
              | 401
              | 403
              | 404
              | 405
              | 500
              | 3
              | 4
              | 406
              | 600
              | 601
              | 602
              | 603
              | 900;
            errorName:
              | "NOT_FOUND"
              | "DB_CONNECTION_ERROR"
              | "DB_QUERY_ERROR"
              | "DB_INSERT_ERROR"
              | "DB_UPDATE_ERROR"
              | "DB_DELETE_ERROR"
              | "INVALID_INPUT"
              | "NOT_SIGNED"
              | "NOT_AUTHORIZED"
              | "OPERATION_NOT_ALLOWED"
              | "ALREADY_EXISTS"
              | "EXTERNAL_SOURCE_ERROR"
              | "DOMAIN_ERROR"
              | "INSUFFICIENT_BALANCE"
              | "INVALID_TRANSACTION"
              | "UNSUPPORTED_PAYMENT_PROVIDER"
              | "INTERNAL_ERROR";
          };
          422: {
            type: "validation";
            on: string;
            summary?: string;
            message?: string;
            found?: unknown;
            property?: string;
            expected?: string;
          };
          500: {
            correlationId?: string | undefined;
            path?: string | undefined;
            message: string;
            statusCode:
              | 200
              | 201
              | 202
              | 204
              | 400
              | 401
              | 403
              | 404
              | 405
              | 409
              | 422
              | 429
              | 500
              | 503
              | 504;
            errorCode:
              | 5
              | 1
              | 2
              | 400
              | 401
              | 403
              | 404
              | 405
              | 500
              | 3
              | 4
              | 406
              | 600
              | 601
              | 602
              | 603
              | 900;
            errorName:
              | "NOT_FOUND"
              | "DB_CONNECTION_ERROR"
              | "DB_QUERY_ERROR"
              | "DB_INSERT_ERROR"
              | "DB_UPDATE_ERROR"
              | "DB_DELETE_ERROR"
              | "INVALID_INPUT"
              | "NOT_SIGNED"
              | "NOT_AUTHORIZED"
              | "OPERATION_NOT_ALLOWED"
              | "ALREADY_EXISTS"
              | "EXTERNAL_SOURCE_ERROR"
              | "DOMAIN_ERROR"
              | "INSUFFICIENT_BALANCE"
              | "INVALID_TRANSACTION"
              | "UNSUPPORTED_PAYMENT_PROVIDER"
              | "INTERNAL_ERROR";
          };
        };
      };
    };
  } & {
    tenants: {
      all: {
        get: {
          body: {};
          params: {};
          query: {
            take?: number | undefined;
            skip?: number | undefined;
            includeDeleted?: boolean | undefined;
          };
          headers: {
            "x-tenant-id"?: string | undefined;
            "x-correlation-id"?: string | undefined;
            authorization: string;
          };
          response: {
            200: {
              statusCode: 200;
              data: {
                tenants: {
                  updatedBy?: string | null | undefined;
                  deletedBy?: string | null | undefined;
                  deletedAt?: Date | null | undefined;
                  name: string;
                  id: string;
                  createdBy: string;
                  createdAt: Date;
                  updatedAt: Date;
                }[];
              };
            };
            401: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            403: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
            422: {
              type: "validation";
              on: string;
              summary?: string;
              message?: string;
              found?: unknown;
              property?: string;
              expected?: string;
            };
            500: {
              correlationId?: string | undefined;
              path?: string | undefined;
              message: string;
              statusCode:
                | 200
                | 201
                | 202
                | 204
                | 400
                | 401
                | 403
                | 404
                | 405
                | 409
                | 422
                | 429
                | 500
                | 503
                | 504;
              errorCode:
                | 5
                | 1
                | 2
                | 400
                | 401
                | 403
                | 404
                | 405
                | 500
                | 3
                | 4
                | 406
                | 600
                | 601
                | 602
                | 603
                | 900;
              errorName:
                | "NOT_FOUND"
                | "DB_CONNECTION_ERROR"
                | "DB_QUERY_ERROR"
                | "DB_INSERT_ERROR"
                | "DB_UPDATE_ERROR"
                | "DB_DELETE_ERROR"
                | "INVALID_INPUT"
                | "NOT_SIGNED"
                | "NOT_AUTHORIZED"
                | "OPERATION_NOT_ALLOWED"
                | "ALREADY_EXISTS"
                | "EXTERNAL_SOURCE_ERROR"
                | "DOMAIN_ERROR"
                | "INSUFFICIENT_BALANCE"
                | "INVALID_TRANSACTION"
                | "UNSUPPORTED_PAYMENT_PROVIDER"
                | "INTERNAL_ERROR";
            };
          };
        };
      };
    };
  },
  {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
  },
  {
    derive: {};
    resolve: {
      scope: ContainerHandler;
    };
    schema: {};
    standaloneSchema: {};
    response: {
      200: Response;
    };
  }
>;
export type App = typeof app;
export declare function createApp(): ReturnType<typeof buildApp>;
export {};
//# sourceMappingURL=app.d.ts.map

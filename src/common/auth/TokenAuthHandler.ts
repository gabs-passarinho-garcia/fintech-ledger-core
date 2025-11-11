import type { IOAuth, AppProviders, IAuthHandler } from '../interfaces';
import { NotSignedError } from '../errors';
import type { SessionHandler } from '../providers/SessionHandler';
import { AccessType } from '../enums';

const ERROR_MESSAGE = 'Invalid authentication credentials.';
const BEARER = 'Bearer';

/**
 * Token authentication handler that validates Bearer tokens via Cognito.
 * Simplified version for generic ledger system - only validates token and enriches session with tenantId.
 */
export class TokenAuthHandler implements IAuthHandler {
  private readonly oAuth: IOAuth;
  private readonly sessionHandler: SessionHandler;

  /**
   * Creates a new TokenAuthHandler instance.
   *
   * @param opts - Dependency injection options
   * @param opts.oauthHandler - The OAuth handler (Cognito)
   * @param opts.sessionHandler - The session handler
   */
  public constructor(opts: {
    [AppProviders.oauthHandler]: IOAuth;
    [AppProviders.sessionHandler]: SessionHandler;
  }) {
    this.oAuth = opts.oauthHandler;
    this.sessionHandler = opts.sessionHandler;
  }

  /**
   * Authenticates a request using Bearer token from headers.
   *
   * @param args - Authentication arguments
   * @param args.headers - Request headers containing authentication information
   * @returns A promise that resolves when authentication is successful
   * @throws {NotSignedError} If authentication fails
   */
  public async auth(args: { headers: Record<string, unknown> }): Promise<void> {
    // Validate user token
    const authorization = args.headers.authorization as string;

    if (!authorization) {
      throw new NotSignedError({
        additionalMessage: ERROR_MESSAGE,
      });
    }

    const [schema, token] = authorization.split(' ');

    if (schema !== BEARER || !token) {
      throw new NotSignedError({
        additionalMessage: ERROR_MESSAGE,
      });
    }

    const { username } = await this.oAuth.authorize({ token });

    // Extract tenantId from headers (required for multi-tenancy)
    const tenantId = args.headers['x-tenant-id'] as string;

    if (!tenantId) {
      throw new NotSignedError({
        additionalMessage: ERROR_MESSAGE,
      });
    }

    // Enrich session with authentication data
    this.sessionHandler.enrich({
      userId: username,
      tenantId,
      accessType: AccessType.AUTH_USER,
    });
  }
}

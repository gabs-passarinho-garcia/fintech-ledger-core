import crypto from 'node:crypto';
import type { AppProviders, IAuthHandler, IVariable } from '../interfaces';
import { NotSignedError } from '../errors';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import { AccessType } from '../enums';

const ERROR_MESSAGE = 'Invalid authentication credentials.';

/**
 * Key authentication handler that validates API keys.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export class KeyAuthHandler implements IAuthHandler {
  private readonly sessionHandler: SessionHandler;
  private readonly secretsHandler: IVariable;

  /**
   * Creates a new KeyAuthHandler instance.
   *
   * @param opts - Dependency injection options
   * @param opts.sessionHandler - The session handler
   * @param opts.secretsHandler - The secrets handler
   */
  public constructor(opts: {
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.secretsHandler]: IVariable;
  }) {
    this.sessionHandler = opts.sessionHandler;
    this.secretsHandler = opts.secretsHandler;
  }

  /**
   * Authenticates a request using API key from headers.
   *
   * @param args - Authentication arguments
   * @param args.headers - Request headers containing authentication information
   * @returns A promise that resolves when authentication is successful
   * @throws {NotSignedError} If authentication fails
   */
  public async auth(args: { headers: Record<string, unknown> }): Promise<void> {
    try {
      const apiKey = args.headers['x-api-key'] as string;

      if (!apiKey) {
        throw new NotSignedError({
          additionalMessage: ERROR_MESSAGE,
        });
      }

      const inputBuffer = new TextEncoder().encode(apiKey);
      const storedBuffer = new TextEncoder().encode(
        (await this.secretsHandler.get('API_KEY')) as string,
      );

      if (inputBuffer.length !== storedBuffer.length) {
        throw new NotSignedError({
          additionalMessage: ERROR_MESSAGE,
        });
      }

      const isValid = crypto.timingSafeEqual(inputBuffer, storedBuffer);

      if (!isValid) {
        throw new NotSignedError({
          additionalMessage: ERROR_MESSAGE,
        });
      }

      const userId = args.headers['x-user-id'] as string | undefined;
      const tenantId = args.headers['x-tenant-id'] as string | undefined;

      this.sessionHandler.enrich({
        accessType: AccessType.API_KEY,
        userId,
        tenantId,
      });
    } catch (error) {
      throw new NotSignedError({
        originalError: error,
        additionalMessage: 'An error occurred during authentication.',
      });
    }
  }
}

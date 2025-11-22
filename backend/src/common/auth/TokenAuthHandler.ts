import type { IOAuth, AppProviders, IAuthHandler } from '../interfaces';
import { NotSignedError } from '../errors';
import type { SessionHandler } from '../providers/SessionHandler';
import { AccessType } from '../enums';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { JwtHelper } from '../providers/auth/JwtHelper';

const ERROR_MESSAGE = 'Invalid authentication credentials.';
const BEARER = 'Bearer';

/**
 * Token authentication handler that validates Bearer tokens via JWT.
 * Supports Master User impersonation via headers.
 */
export class TokenAuthHandler implements IAuthHandler {
  private readonly oAuth: IOAuth;
  private readonly sessionHandler: SessionHandler;
  private readonly getUserRepository: GetUserRepository;
  private readonly jwtHelper: JwtHelper;

  /**
   * Creates a new TokenAuthHandler instance.
   *
   * @param opts - Dependency injection options
   * @param opts.oauthHandler - The OAuth handler (JWT-based)
   * @param opts.sessionHandler - The session handler
   * @param opts.getUserRepository - Repository to fetch user data
   * @param opts.jwtHelper - JWT helper for token verification
   */
  public constructor(opts: {
    [AppProviders.oauthHandler]: IOAuth;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.jwtHelper]: JwtHelper;
  }) {
    this.oAuth = opts.oauthHandler;
    this.sessionHandler = opts.sessionHandler;
    this.getUserRepository = opts.getUserRepository;
    this.jwtHelper = opts.jwtHelper;
  }

  /**
   * Authenticates a request using Bearer token from headers.
   * Supports Master User impersonation via x-impersonate-user-id and x-impersonate-tenant-id headers.
   *
   * @param args - Authentication arguments
   * @param args.headers - Request headers containing authentication information
   * @returns A promise that resolves when authentication is successful
   * @throws {NotSignedError} If authentication fails
   */
  public async auth(args: { headers: Record<string, unknown> }): Promise<void> {
    const token = this.extractToken(args.headers);
    const payload = await this.verifyToken(token);
    const user = await this.validateUser(payload.userId);
    const { finalUserId, finalTenantId } = await this.resolveImpersonation(
      user,
      payload.userId,
      args.headers,
    );

    this.enrichSession(user, payload.userId, finalUserId, finalTenantId);
  }

  /**
   * Extracts and validates Bearer token from headers.
   *
   * @param headers - Request headers
   * @returns The JWT token
   * @throws {NotSignedError} If token is missing or invalid
   */
  private extractToken(headers: Record<string, unknown>): string {
    const authorization = headers.authorization as string;

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

    return token;
  }

  /**
   * Verifies JWT token and returns payload.
   *
   * @param token - The JWT token
   * @returns The JWT payload
   * @throws {NotSignedError} If token is invalid
   */
  private async verifyToken(token: string): Promise<{ userId: string; isMaster: boolean }> {
    await this.oAuth.authorize({ token });
    return this.jwtHelper.verify(token);
  }

  /**
   * Validates user exists and is not deleted.
   *
   * @param userId - The user ID
   * @returns The user entity
   * @throws {NotSignedError} If user is not found or deleted
   */
  private async validateUser(userId: string): Promise<{
    id: string;
    isMaster: boolean;
    deletedAt?: Date | null;
  }> {
    const user = await this.getUserRepository.findById({ userId });

    if (!user || user.deletedAt) {
      throw new NotSignedError({
        additionalMessage: ERROR_MESSAGE,
      });
    }

    return {
      id: user.id,
      isMaster: user.isMaster,
      deletedAt: user.deletedAt,
    };
  }

  /**
   * Resolves impersonation logic for Master Users.
   *
   * @param user - The authenticated user
   * @param authenticatedUserId - The authenticated user ID
   * @param headers - Request headers
   * @returns Final user ID and tenant ID
   * @throws {NotSignedError} If impersonation fails or tenantId is missing
   */
  private async resolveImpersonation(
    user: { id: string; isMaster: boolean },
    authenticatedUserId: string,
    headers: Record<string, unknown>,
  ): Promise<{ finalUserId: string; finalTenantId: string | undefined }> {
    const impersonateUserId = headers['x-impersonate-user-id'] as string | undefined;
    const impersonateTenantId = headers['x-impersonate-tenant-id'] as string | undefined;
    let finalUserId = authenticatedUserId;
    let finalTenantId = headers['x-tenant-id'] as string | undefined;

    if (user.isMaster && (impersonateUserId || impersonateTenantId)) {
      if (impersonateUserId) {
        finalUserId = await this.validateImpersonatedUser(impersonateUserId);
      }

      if (impersonateTenantId) {
        finalTenantId = impersonateTenantId;
      }
    } else if (!finalTenantId) {
      throw new NotSignedError({
        additionalMessage: ERROR_MESSAGE,
      });
    }

    return { finalUserId, finalTenantId };
  }

  /**
   * Validates that impersonated user exists.
   *
   * @param userId - The user ID to impersonate
   * @returns The user ID if valid
   * @throws {NotSignedError} If user is not found
   */
  private async validateImpersonatedUser(userId: string): Promise<string> {
    const impersonatedUser = await this.getUserRepository.findById({ userId });

    if (!impersonatedUser || impersonatedUser.deletedAt) {
      throw new NotSignedError({
        additionalMessage: 'Impersonated user not found',
      });
    }

    return userId;
  }

  /**
   * Enriches session with authentication data.
   *
   * @param user - The authenticated user
   * @param authenticatedUserId - The authenticated user ID
   * @param finalUserId - The final user ID (may be impersonated)
   * @param finalTenantId - The final tenant ID
   */
  private enrichSession(
    user: { isMaster: boolean },
    authenticatedUserId: string,
    finalUserId: string,
    finalTenantId: string | undefined,
  ): void {
    const sessionData: {
      userId: string;
      tenantId?: string;
      accessType: AccessType;
      masterUserId?: string;
    } = {
      userId: finalUserId,
      tenantId: finalTenantId,
      accessType: AccessType.AUTH_USER,
    };

    // Store master user ID for audit purposes if impersonating
    if (user.isMaster && finalUserId !== authenticatedUserId) {
      sessionData.masterUserId = authenticatedUserId;
    }

    this.sessionHandler.enrich(sessionData);
  }
}

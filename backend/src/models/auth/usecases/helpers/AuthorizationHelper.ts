import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '../../infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '../../infra/repositories/GetProfileRepository';
import { ForbiddenError, NotFoundError } from '@/common/errors';

const USER_NOT_AUTHENTICATED_MESSAGE = 'User not authenticated';

/**
 * Helper class for authorization checks.
 * Provides methods to verify user ownership and master user privileges.
 */
export class AuthorizationHelper {
  private readonly sessionHandler: SessionHandler;
  private readonly getUserRepository: GetUserRepository;
  private readonly getProfileRepository: GetProfileRepository;

  public constructor(opts: {
    sessionHandler: SessionHandler;
    getUserRepository: GetUserRepository;
    getProfileRepository: GetProfileRepository;
  }) {
    this.sessionHandler = opts.sessionHandler;
    this.getUserRepository = opts.getUserRepository;
    this.getProfileRepository = opts.getProfileRepository;
  }

  /**
   * Checks if the authenticated user is a master user.
   *
   * @returns True if the user is a master user
   * @throws {ForbiddenError} If the user is not a master user
   */
  public async requireMaster(): Promise<void> {
    const session = this.sessionHandler.get();
    const userId = session.userId;

    if (!userId) {
      throw new ForbiddenError({
        message: USER_NOT_AUTHENTICATED_MESSAGE,
      });
    }

    const user = await this.getUserRepository.findById({ userId });

    if (!user || !user.isMaster) {
      throw new ForbiddenError({
        message: 'Master user privileges required',
      });
    }
  }

  /**
   * Checks if the authenticated user owns a profile or is a master user.
   *
   * @param profileId - The profile ID to check ownership for
   * @throws {ForbiddenError} If the user is not authorized
   * @throws {NotFoundError} If the profile is not found
   */
  public async checkProfileOwnership(profileId: string): Promise<void> {
    const session = this.sessionHandler.get();
    const userId = session.userId;

    if (!userId) {
      throw new ForbiddenError({
        message: USER_NOT_AUTHENTICATED_MESSAGE,
      });
    }

    // Get authenticated user to check if master
    const user = await this.getUserRepository.findById({ userId });

    if (!user) {
      throw new ForbiddenError({
        message: 'User not found',
      });
    }

    // Master users can access any profile
    if (user.isMaster) {
      return;
    }

    // Get profile to check ownership
    const profile = await this.getProfileRepository.findById({ profileId });

    if (!profile) {
      throw new NotFoundError({
        message: `Profile with ID ${profileId} not found`,
      });
    }

    // Check if user owns the profile
    if (profile.userId !== userId) {
      throw new ForbiddenError({
        message: 'You do not have permission to access this profile',
      });
    }
  }

  /**
   * Checks if the authenticated user owns a user account or is a master user.
   *
   * @param targetUserId - The user ID to check ownership for
   * @throws {ForbiddenError} If the user is not authorized
   * @throws {NotFoundError} If the user is not found
   */
  public async checkUserOwnership(targetUserId: string): Promise<void> {
    const session = this.sessionHandler.get();
    const userId = session.userId;

    if (!userId) {
      throw new ForbiddenError({
        message: USER_NOT_AUTHENTICATED_MESSAGE,
      });
    }

    // Get authenticated user to check if master
    const user = await this.getUserRepository.findById({ userId });

    if (!user) {
      throw new ForbiddenError({
        message: 'User not found',
      });
    }

    // Master users can access any user
    if (user.isMaster) {
      return;
    }

    // Check if user owns the account
    if (userId !== targetUserId) {
      throw new ForbiddenError({
        message: 'You do not have permission to access this user',
      });
    }
  }

  /**
   * Gets the authenticated user ID from session.
   *
   * @returns The authenticated user ID
   * @throws {ForbiddenError} If the user is not authenticated
   */
  public getAuthenticatedUserId(): string {
    const session = this.sessionHandler.get();
    const userId = session.userId;

    if (!userId) {
      throw new ForbiddenError({
        message: USER_NOT_AUTHENTICATED_MESSAGE,
      });
    }

    return userId;
  }
}

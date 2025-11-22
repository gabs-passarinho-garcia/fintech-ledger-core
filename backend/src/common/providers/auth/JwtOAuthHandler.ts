import type { IOAuth, OAuthSignInOutput } from '@/common/interfaces';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotSignedError, InternalError } from '@/common/errors';
import { Logger } from '../Logger';
import type { JwtHelper } from './JwtHelper';
import type { PasswordHandler } from './PasswordHandler';
import { randomBytes } from 'node:crypto';
import type { GetUserByUsernameRepository } from '@/models/auth/infra/repositories/GetUserByUsernameRepository';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { CreateRefreshTokenRepository } from '@/models/auth/infra/repositories/CreateRefreshTokenRepository';
import type { GetRefreshTokenRepository } from '@/models/auth/infra/repositories/GetRefreshTokenRepository';
import type { DeleteRefreshTokenRepository } from '@/models/auth/infra/repositories/DeleteRefreshTokenRepository';
import type { UpdateUserPasswordRepository } from '@/models/auth/infra/repositories/UpdateUserPasswordRepository';
import type { CreateUserRepository } from '@/models/auth/infra/repositories/CreateUserRepository';
import { UserFactory } from '@/models/auth/domain/User.factory';

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN = 15 * 60; // 15 minutes
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days
const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';

/**
 * JWT-based OAuth handler that implements IOAuth interface.
 * Provides authentication using JWT tokens signed with ES256 (ECDSA).
 * Replaces Cognito-based authentication with a self-hosted solution.
 */
export class JwtOAuthHandler implements IOAuth {
  private readonly jwtHelper: JwtHelper;
  private readonly passwordHandler: PasswordHandler;
  private readonly logger: Logger;
  private readonly getUserByUsernameRepository: GetUserByUsernameRepository;
  private readonly getUserRepository: GetUserRepository;
  private readonly createRefreshTokenRepository: CreateRefreshTokenRepository;
  private readonly getRefreshTokenRepository: GetRefreshTokenRepository;
  private readonly deleteRefreshTokenRepository: DeleteRefreshTokenRepository;
  private readonly updateUserPasswordRepository: UpdateUserPasswordRepository;
  private readonly createUserRepository: CreateUserRepository;
  private readonly accessTokenExpiresIn: number;
  private readonly refreshTokenExpiresIn: number;

  /**
   * Creates a new JwtOAuthHandler instance.
   *
   * @param opts - Dependency injection options
   */
  public constructor(opts: {
    [AppProviders.logger]: Logger;
    [AppProviders.jwtHelper]: JwtHelper;
    [AppProviders.getUserByUsernameRepository]: GetUserByUsernameRepository;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.createRefreshTokenRepository]: CreateRefreshTokenRepository;
    [AppProviders.getRefreshTokenRepository]: GetRefreshTokenRepository;
    [AppProviders.deleteRefreshTokenRepository]: DeleteRefreshTokenRepository;
    [AppProviders.updateUserPasswordRepository]: UpdateUserPasswordRepository;
    [AppProviders.createUserRepository]: CreateUserRepository;
    [AppProviders.passwordHandler]: PasswordHandler;
  }) {
    this.logger = opts[AppProviders.logger].setService('JwtOAuthHandler');
    this.jwtHelper = opts[AppProviders.jwtHelper];
    this.getUserByUsernameRepository = opts[AppProviders.getUserByUsernameRepository];
    this.getUserRepository = opts[AppProviders.getUserRepository];
    this.createRefreshTokenRepository = opts[AppProviders.createRefreshTokenRepository];
    this.getRefreshTokenRepository = opts[AppProviders.getRefreshTokenRepository];
    this.deleteRefreshTokenRepository = opts[AppProviders.deleteRefreshTokenRepository];
    this.updateUserPasswordRepository = opts[AppProviders.updateUserPasswordRepository];
    this.createUserRepository = opts[AppProviders.createUserRepository];
    this.passwordHandler = opts[AppProviders.passwordHandler];

    // Get token expiration times from environment
    const accessTokenExpiresInEnv = Bun.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
    const refreshTokenExpiresInEnv = Bun.env.JWT_REFRESH_TOKEN_EXPIRES_IN;

    this.accessTokenExpiresIn =
      this.parseExpiresIn(accessTokenExpiresInEnv) ?? DEFAULT_ACCESS_TOKEN_EXPIRES_IN;
    this.refreshTokenExpiresIn =
      this.parseExpiresIn(refreshTokenExpiresInEnv) ?? DEFAULT_REFRESH_TOKEN_EXPIRES_IN;
  }

  /**
   * Signs in a user with username and password.
   *
   * @param args - Sign-in arguments
   * @param args.username - User's username
   * @param args.password - User's password
   * @returns A promise that resolves to OAuth sign-in output
   * @throws {NotFoundError} If user is not found
   * @throws {NotSignedError} If password is incorrect
   */
  public async signIn(args: { username: string; password: string }): Promise<OAuthSignInOutput> {
    const { username, password } = args;

    this.logger.debug({ username }, 'sign_in:start', 'JwtOAuthHandler');

    // Find user by username
    const user = await this.getUserByUsernameRepository.findByUsername({ username });

    // Always verify password, even if user doesn't exist, to prevent user enumeration
    // Use a dummy hash comparison to maintain consistent timing
    const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy';
    const providedHash = user?.passwordHash ?? dummyHash;

    const isValidPassword = await this.passwordHandler.verify(password, providedHash);

    // If user doesn't exist or password is invalid, return generic error
    if (!user || !isValidPassword) {
      this.logger.warn(
        { username, userExists: !!user },
        'sign_in:invalid_credentials',
        'JwtOAuthHandler',
      );
      throw new NotSignedError({
        additionalMessage: INVALID_CREDENTIALS_MESSAGE,
      });
    }

    // Generate access token
    const accessToken = this.jwtHelper.sign(
      {
        userId: user.id,
        username: user.username,
        isMaster: user.isMaster,
      },
      this.accessTokenExpiresIn,
    );

    // Generate refresh token (random string stored in database)
    const refreshToken = randomBytes(32).toString('hex');

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiresIn * 1000);
    await this.createRefreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    this.logger.info({ username, userId: user.id }, 'sign_in:success', 'JwtOAuthHandler');

    return {
      username: user.username,
      status: 'CONFIRMED',
      tokenType: 'Bearer',
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiresIn,
    };
  }

  /**
   * Refreshes an access token using a refresh token.
   *
   * @param args - Refresh token arguments
   * @param args.refreshToken - The refresh token
   * @param args.username - User's username
   * @returns A promise that resolves to OAuth sign-in output
   * @throws {NotSignedError} If refresh token is invalid or expired
   */
  public async refreshToken(args: {
    refreshToken: string;
    username: string;
  }): Promise<OAuthSignInOutput> {
    const { refreshToken, username } = args;

    this.logger.debug({ username }, 'refresh_token:start', 'JwtOAuthHandler');

    // Find user by username
    const user = await this.getUserByUsernameRepository.findByUsername({ username });

    if (!user) {
      throw new NotSignedError({
        additionalMessage: INVALID_CREDENTIALS_MESSAGE,
      });
    }

    // Find refresh token in database
    const storedToken = await this.getRefreshTokenRepository.findByToken({
      token: refreshToken,
      userId: user.id,
    });

    if (!storedToken || storedToken.revokedAt) {
      throw new NotSignedError({
        additionalMessage: 'Invalid refresh token',
      });
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Revoke expired token
      await this.deleteRefreshTokenRepository.revoke({ token: refreshToken });
      throw new NotSignedError({
        additionalMessage: 'Refresh token has expired',
      });
    }

    // Generate new access token
    const accessToken = this.jwtHelper.sign(
      {
        userId: user.id,
        username: user.username,
        isMaster: user.isMaster,
      },
      this.accessTokenExpiresIn,
    );

    this.logger.info({ username, userId: user.id }, 'refresh_token:success', 'JwtOAuthHandler');

    return {
      username: user.username,
      status: 'CONFIRMED',
      tokenType: 'Bearer',
      accessToken,
      refreshToken, // Return same refresh token
      expiresIn: this.accessTokenExpiresIn,
    };
  }

  /**
   * Authorizes a token and returns the username.
   *
   * @param args - Authorization arguments
   * @param args.token - The access token to authorize
   * @returns A promise that resolves to user information
   * @throws {NotSignedError} If token is invalid or expired
   */
  public async authorize(args: { token: string }): Promise<{ username: string }> {
    const { token } = args;

    try {
      const payload = this.jwtHelper.verify(token);

      // Verify user still exists and is not deleted
      const user = await this.getUserRepository.findById({ userId: payload.userId });

      if (!user || user.deletedAt) {
        throw new NotSignedError({
          additionalMessage: INVALID_CREDENTIALS_MESSAGE,
        });
      }

      return {
        username: payload.username,
      };
    } catch (error) {
      if (error instanceof NotSignedError) {
        throw error;
      }

      throw new NotSignedError({
        originalError: error,
        additionalMessage: 'Invalid token',
      });
    }
  }

  /**
   * Changes a user's password.
   *
   * @param args - Change password arguments
   * @param args.username - User's username
   * @param args.newPassword - The new password
   * @returns A promise that resolves to success status
   * @throws {NotFoundError} If user is not found
   */
  public async changePassword(args: {
    username: string;
    newPassword: string;
  }): Promise<{ success: boolean }> {
    const { username, newPassword } = args;

    this.logger.debug({ username }, 'change_password:start', 'JwtOAuthHandler');

    // Find user
    const user = await this.getUserByUsernameRepository.findByUsername({ username });

    if (!user) {
      throw new NotSignedError({
        additionalMessage: INVALID_CREDENTIALS_MESSAGE,
      });
    }

    // Hash new password
    const passwordHash = await this.passwordHandler.hash(newPassword);

    // Update password
    await this.updateUserPasswordRepository.update({
      userId: user.id,
      passwordHash,
    });

    this.logger.info({ username, userId: user.id }, 'change_password:success', 'JwtOAuthHandler');

    return { success: true };
  }

  /**
   * Changes a temporary password to a permanent one.
   * For JWT-based auth, this is the same as changePassword.
   *
   * @param args - Change password arguments
   * @param args.username - User's username
   * @param args.temporaryPassword - The temporary password
   * @param args.newPassword - The new permanent password
   * @returns A promise that resolves to success status
   * @throws {NotFoundError} If user is not found
   * @throws {NotSignedError} If temporary password is incorrect
   */
  public async changeTemporaryPassword(args: {
    username: string;
    temporaryPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> {
    const { username, temporaryPassword, newPassword } = args;

    this.logger.debug({ username }, 'change_temporary_password:start', 'JwtOAuthHandler');

    // Find user
    const user = await this.getUserByUsernameRepository.findByUsername({ username });

    // Always verify password, even if user doesn't exist, to prevent user enumeration
    const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy';
    const providedHash = user?.passwordHash ?? dummyHash;

    const isValidPassword = await this.passwordHandler.verify(temporaryPassword, providedHash);

    // If user doesn't exist or password is invalid, return generic error
    if (!user || !isValidPassword) {
      throw new NotSignedError({
        additionalMessage: INVALID_CREDENTIALS_MESSAGE,
      });
    }

    // Hash new password
    const passwordHash = await this.passwordHandler.hash(newPassword);

    // Update password
    await this.updateUserPasswordRepository.update({
      userId: user.id,
      passwordHash,
    });

    this.logger.info(
      { username, userId: user.id },
      'change_temporary_password:success',
      'JwtOAuthHandler',
    );

    return { success: true };
  }

  /**
   * Signs up a new user.
   *
   * @param args - Sign-up arguments
   * @param args.username - User's username
   * @param args.useremail - User's email
   * @param args.password - User's password
   * @returns A promise that resolves when sign-up is complete
   * @throws {InternalError} If user creation fails
   */
  public async signUp(args: {
    username: string;
    useremail: string;
    password: string;
  }): Promise<void> {
    const { username, password } = args;

    this.logger.debug({ username }, 'sign_up:start', 'JwtOAuthHandler');

    // Check if user already exists
    const existingUser = await this.getUserByUsernameRepository.findByUsername({ username });

    if (existingUser) {
      throw new InternalError({
        additionalMessage: 'User already exists',
      });
    }

    // Hash password
    const passwordHash = await this.passwordHandler.hash(password);

    // Create user
    const user = UserFactory.create({
      username,
      passwordHash,
      isMaster: false,
    });

    await this.createUserRepository.create({ user });

    this.logger.info({ username, userId: user.id }, 'sign_up:success', 'JwtOAuthHandler');
  }

  /**
   * Parses expires in string (e.g., "15m", "7d") to seconds.
   *
   * @param expiresIn - The expiration string
   * @returns The expiration in seconds, or null if invalid
   */
  private parseExpiresIn(expiresIn: string | undefined): number | null {
    if (!expiresIn) {
      return null;
    }

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return null;
    }

    const value = parseInt(match[1] ?? '0', 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return null;
    }
  }
}

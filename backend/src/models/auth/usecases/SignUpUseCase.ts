import type { IService } from '@/common/interfaces/IService';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { PasswordHandler } from '@/common/providers/auth/PasswordHandler';
import type { CreateUserRepository } from '../infra/repositories/CreateUserRepository';
import type { CreateProfileRepository } from '../infra/repositories/CreateProfileRepository';
import type { GetUserByUsernameRepository } from '../infra/repositories/GetUserByUsernameRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { UserFactory } from '../domain/User.factory';
import { ProfileFactory } from '../domain/Profile.factory';
import { InternalError } from '@/common/errors';
import type { SignUpRequest, SignUpResponse } from '../dtos/SignUp.dto';

export type SignUpInput = SignUpRequest;

export type SignUpOutput = SignUpResponse;

/**
 * Use case for signing up a new user.
 * Creates a user account and optionally an initial profile if tenantId is provided.
 * All operations are executed within a transaction to ensure atomicity.
 */
export class SignUpUseCase implements IService<SignUpInput, SignUpOutput> {
  private readonly transactionManager: ITransactionManager;
  private readonly logger: ILogger;
  private readonly passwordHandler: PasswordHandler;
  private readonly createUserRepository: CreateUserRepository;
  private readonly createProfileRepository: CreateProfileRepository;
  private readonly getUserByUsernameRepository: GetUserByUsernameRepository;

  public constructor(opts: {
    [AppProviders.transactionManager]: ITransactionManager;
    [AppProviders.logger]: ILogger;
    [AppProviders.passwordHandler]: PasswordHandler;
    [AppProviders.createUserRepository]: CreateUserRepository;
    [AppProviders.createProfileRepository]: CreateProfileRepository;
    [AppProviders.getUserByUsernameRepository]: GetUserByUsernameRepository;
  }) {
    this.transactionManager = opts[AppProviders.transactionManager];
    this.logger = opts[AppProviders.logger];
    this.passwordHandler = opts[AppProviders.passwordHandler];
    this.createUserRepository = opts[AppProviders.createUserRepository];
    this.createProfileRepository = opts[AppProviders.createProfileRepository];
    this.getUserByUsernameRepository = opts[AppProviders.getUserByUsernameRepository];
  }

  /**
   * Executes the sign up use case.
   * Creates a user and optionally an initial profile within a transaction.
   *
   * @param input - The input data for signing up
   * @returns The created user and profile (if created)
   * @throws {InternalError} If user already exists or creation fails
   */
  public async execute(input: SignUpInput): Promise<SignUpOutput> {
    this.logger.info(
      {
        username: input.username,
        email: input.email,
        hasTenantId: !!input.tenantId,
      },
      'sign_up:start',
      SignUpUseCase.name,
    );

    // Check if user already exists
    const existingUser = await this.getUserByUsernameRepository.findByUsername({
      username: input.username,
    });

    if (existingUser) {
      throw new InternalError({
        additionalMessage: 'User already exists',
      });
    }

    // Hash password
    const passwordHash = await this.passwordHandler.hash(input.password);

    // Execute within transaction
    const result = await this.transactionManager.runInTransaction(async (tx) => {
      // Create user
      const user = UserFactory.create({
        username: input.username,
        passwordHash,
        isMaster: false,
      });

      const createdUser = await this.createUserRepository.create({ user, tx });

      let profile;

      // Create initial profile if tenantId is provided
      if (input.tenantId) {
        const profileEntity = ProfileFactory.create({
          userId: createdUser.id,
          tenantId: input.tenantId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
        });

        profile = await this.createProfileRepository.create({ profile: profileEntity, tx });
      }

      return {
        user: {
          id: createdUser.id,
          username: createdUser.username,
          createdAt: createdUser.createdAt,
        },
        profile: profile
          ? {
              id: profile.id,
              userId: profile.userId,
              tenantId: profile.tenantId,
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              createdAt: profile.createdAt,
            }
          : undefined,
      };
    });

    this.logger.info(
      {
        userId: result.user.id,
        username: result.user.username,
        hasProfile: !!result.profile,
      },
      'sign_up:success',
      SignUpUseCase.name,
    );

    return result;
  }
}

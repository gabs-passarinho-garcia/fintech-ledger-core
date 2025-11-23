import type { IService } from '@/common/interfaces/IService';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { CreateProfileRepository } from '../infra/repositories/CreateProfileRepository';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import type { GetTenantRepository } from '@/models/tenant/infra/repositories/GetTenantRepository';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '../infra/repositories/GetUserRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { ProfileFactory } from '../domain/Profile.factory';
import { NotFoundError, InternalError } from '@/common/errors';
import { AuthorizationHelper } from './helpers/AuthorizationHelper';
import type { CreateProfileRequest, CreateProfileResponse } from '../dtos/CreateProfile.dto';

export type CreateProfileInput = CreateProfileRequest;

export type CreateProfileOutput = CreateProfileResponse;

/**
 * Use case for creating a profile for an authenticated user.
 * Validates that the tenant exists and is not deleted, and that the user doesn't already have a profile for that tenant.
 * All operations are executed within a transaction to ensure atomicity.
 */
export class CreateProfileUseCase implements IService<CreateProfileInput, CreateProfileOutput> {
  private readonly transactionManager: ITransactionManager;
  private readonly logger: ILogger;
  private readonly createProfileRepository: CreateProfileRepository;
  private readonly getProfileRepository: GetProfileRepository;
  private readonly getTenantRepository: GetTenantRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.transactionManager]: ITransactionManager;
    [AppProviders.logger]: ILogger;
    [AppProviders.createProfileRepository]: CreateProfileRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.getTenantRepository]: GetTenantRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
  }) {
    this.transactionManager = opts[AppProviders.transactionManager];
    this.logger = opts[AppProviders.logger];
    this.createProfileRepository = opts[AppProviders.createProfileRepository];
    this.getProfileRepository = opts[AppProviders.getProfileRepository];
    this.getTenantRepository = opts[AppProviders.getTenantRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the create profile use case.
   * Creates a profile for the authenticated user within a transaction.
   *
   * @param input - The input data for creating the profile
   * @returns The created profile
   * @throws {NotFoundError} If the tenant is not found or is deleted
   * @throws {InternalError} If the user already has a profile for that tenant
   */
  public async execute(input: CreateProfileInput): Promise<CreateProfileOutput> {
    const userId = this.authorizationHelper.getAuthenticatedUserId();

    this.logger.info(
      {
        userId,
        tenantId: input.tenantId,
        email: input.email,
      },
      'create_profile:start',
      CreateProfileUseCase.name,
    );

    // Validate tenant exists and is not deleted
    const tenant = await this.getTenantRepository.findById({ tenantId: input.tenantId });

    if (!tenant) {
      throw new NotFoundError({
        message: `Tenant with ID ${input.tenantId} not found`,
      });
    }

    if (tenant.deletedAt) {
      throw new NotFoundError({
        message: `Tenant with ID ${input.tenantId} is deleted`,
      });
    }

    // Check if user already has a profile for this tenant
    const existingProfile = await this.getProfileRepository.findByUserIdAndTenantId({
      userId,
      tenantId: input.tenantId,
    });

    if (existingProfile) {
      throw new InternalError({
        additionalMessage: `User already has a profile for tenant ${input.tenantId}`,
      });
    }

    // Execute within transaction
    const result = await this.transactionManager.runInTransaction(async (tx) => {
      const profileEntity = ProfileFactory.create({
        userId,
        tenantId: input.tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
      });

      const createdProfile = await this.createProfileRepository.create({
        profile: profileEntity,
        tx,
      });

      return {
        id: createdProfile.id,
        userId: createdProfile.userId,
        tenantId: createdProfile.tenantId,
        firstName: createdProfile.firstName,
        lastName: createdProfile.lastName,
        email: createdProfile.email,
        createdAt: createdProfile.createdAt,
        updatedAt: createdProfile.updatedAt,
      };
    });

    this.logger.info(
      {
        userId,
        profileId: result.id,
        tenantId: result.tenantId,
      },
      'create_profile:success',
      CreateProfileUseCase.name,
    );

    return result;
  }
}

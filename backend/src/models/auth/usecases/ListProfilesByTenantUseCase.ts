import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { ListProfilesByTenantRepository } from '../infra/repositories/ListProfilesByTenantRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from './helpers/AuthorizationHelper';
import type { GetUserRepository } from '../infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import { SessionContextExtractor } from './helpers/SessionContextExtractor';
import { ForbiddenError } from '@/common/errors';
import type { ListProfilesByTenantResponse } from '../dtos/ListProfilesByTenant.dto';

export interface ListProfilesByTenantInput {
  tenantId: string;
}

export type ListProfilesByTenantOutput = ListProfilesByTenantResponse;

/**
 * Use case for listing profiles by tenant ID.
 * Returns all profiles associated with a specific tenant.
 * Users can only list profiles for tenants they have access to.
 */
export class ListProfilesByTenantUseCase
  implements IService<ListProfilesByTenantInput, ListProfilesByTenantOutput>
{
  private readonly logger: ILogger;
  private readonly listProfilesByTenantRepository: ListProfilesByTenantRepository;
  private readonly authorizationHelper: AuthorizationHelper;
  private readonly sessionHandler: SessionHandler;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listProfilesByTenantRepository]: ListProfilesByTenantRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listProfilesByTenantRepository = opts[AppProviders.listProfilesByTenantRepository];
    this.sessionHandler = opts[AppProviders.sessionHandler];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list profiles by tenant use case.
   * Lists all profiles for the specified tenant.
   * Users can only access profiles for tenants they belong to (unless they are master users).
   *
   * @param input - The input data with tenantId
   * @returns List of profiles for the specified tenant
   * @throws {ForbiddenError} If user is not authenticated or doesn't have access to the tenant
   */
  public async execute(input: ListProfilesByTenantInput): Promise<ListProfilesByTenantOutput> {
    const userId = this.authorizationHelper.getAuthenticatedUserId();
    const session = this.sessionHandler.get();
    const sessionTenantId = SessionContextExtractor.extractTenantId(session);

    this.logger.info(
      {
        userId,
        tenantId: input.tenantId,
        sessionTenantId,
      },
      'list_profiles_by_tenant:start',
      ListProfilesByTenantUseCase.name,
    );

    // Verify user has access to the requested tenant
    // Master users can access any tenant, regular users can only access their current tenant
    if (sessionTenantId && sessionTenantId !== input.tenantId) {
      // Check if user is master (master users can access any tenant)
      try {
        await this.authorizationHelper.requireMaster();
      } catch {
        throw new ForbiddenError({
          message: 'User does not have access to this tenant',
        });
      }
    }

    const profiles = await this.listProfilesByTenantRepository.listByTenantId({
      tenantId: input.tenantId,
    });

    this.logger.info(
      {
        userId,
        tenantId: input.tenantId,
        profileCount: profiles.length,
      },
      'list_profiles_by_tenant:success',
      ListProfilesByTenantUseCase.name,
    );

    return {
      profiles: profiles.map((profile) => ({
        id: profile.id,
        userId: profile.userId,
        tenantId: profile.tenantId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        balance: profile.balance.toString(),
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      })),
    };
  }
}

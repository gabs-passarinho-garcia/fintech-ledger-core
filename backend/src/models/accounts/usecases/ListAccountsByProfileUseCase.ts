import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import type { ListAccountsByProfileIdRepository } from '../infra/repositories/ListAccountsByProfileIdRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';
import { SessionContextExtractor } from '@/models/auth/usecases/helpers/SessionContextExtractor';

export interface AccountOutput {
  id: string;
  tenantId: string;
  profileId: string | null;
  name: string;
  balance: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListAccountsByProfileInput {
  profileId: string;
}

export interface ListAccountsByProfileOutput {
  accounts: AccountOutput[];
}

/**
 * Use case for listing accounts by profile ID.
 * Can be used by master users to list accounts for any profile.
 */
export class ListAccountsByProfileUseCase
  implements IService<ListAccountsByProfileInput, ListAccountsByProfileOutput>
{
  private readonly logger: ILogger;
  private readonly sessionHandler: SessionHandler;
  private readonly getProfileRepository: GetProfileRepository;
  private readonly listAccountsByProfileIdRepository: ListAccountsByProfileIdRepository;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.listAccountsByProfileIdRepository]: ListAccountsByProfileIdRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.sessionHandler = opts[AppProviders.sessionHandler];
    this.getProfileRepository = opts[AppProviders.getProfileRepository];
    this.listAccountsByProfileIdRepository = opts[AppProviders.listAccountsByProfileIdRepository];
  }

  /**
   * Executes the list accounts by profile use case.
   *
   * @param input - The input data containing profileId
   * @returns The accounts data
   * @throws {NotFoundError} If profile is not found
   */
  public async execute(input: ListAccountsByProfileInput): Promise<ListAccountsByProfileOutput> {
    const session = this.sessionHandler.get();
    const tenantId = SessionContextExtractor.extractTenantId(session);

    this.logger.info(
      {
        profileId: input.profileId,
        tenantId,
      },
      'list_accounts_by_profile:start',
      ListAccountsByProfileUseCase.name,
    );

    // Verify profile exists
    const profile = await this.getProfileRepository.findById({
      profileId: input.profileId,
    });

    if (!profile) {
      throw new NotFoundError({
        message: `Profile with ID ${input.profileId} not found`,
      });
    }

    // Verify profile belongs to the same tenant
    if (profile.tenantId !== tenantId) {
      throw new NotFoundError({
        message: `Profile with ID ${input.profileId} not found for tenant ${tenantId}`,
      });
    }

    // Get accounts for the profile
    const accounts = await this.listAccountsByProfileIdRepository.findByProfileId({
      profileId: input.profileId,
      tenantId,
    });

    this.logger.info(
      {
        profileId: input.profileId,
        accountCount: accounts.length,
      },
      'list_accounts_by_profile:success',
      ListAccountsByProfileUseCase.name,
    );

    return {
      accounts: accounts.map((account) => ({
        id: account.id,
        tenantId: account.tenantId,
        profileId: account.profileId,
        name: account.name,
        balance: account.balance.toString(),
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    };
  }
}

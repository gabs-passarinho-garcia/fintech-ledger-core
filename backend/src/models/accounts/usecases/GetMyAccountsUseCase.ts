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

export type GetMyAccountsInput = Record<string, never>;

export interface GetMyAccountsOutput {
  accounts: AccountOutput[];
}

/**
 * Use case for getting accounts for the authenticated user's profile.
 * Returns all accounts associated with the user's current profile.
 */
export class GetMyAccountsUseCase implements IService<GetMyAccountsInput, GetMyAccountsOutput> {
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
   * Executes the get my accounts use case.
   * Returns all accounts for the authenticated user's profile.
   *
   * @param _input - Empty input (uses authenticated user from session)
   * @returns The accounts data
   * @throws {NotFoundError} If profile is not found
   */
  public async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: GetMyAccountsInput = {} as GetMyAccountsInput,
  ): Promise<GetMyAccountsOutput> {
    const session = this.sessionHandler.get();
    const userId = SessionContextExtractor.extractUserId(session);
    const tenantId = SessionContextExtractor.extractTenantId(session);

    this.logger.info(
      {
        userId,
        tenantId,
      },
      'get_my_accounts:start',
      GetMyAccountsUseCase.name,
    );

    // Get user's profile for the current tenant
    const profile = await this.getProfileRepository.findByUserIdAndTenantId({
      userId,
      tenantId,
    });

    if (!profile) {
      throw new NotFoundError({
        message: 'Profile not found for authenticated user',
      });
    }

    // Get accounts for the profile
    const accounts = await this.listAccountsByProfileIdRepository.findByProfileId({
      profileId: profile.id,
      tenantId,
    });

    this.logger.info(
      {
        profileId: profile.id,
        accountCount: accounts.length,
      },
      'get_my_accounts:success',
      GetMyAccountsUseCase.name,
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

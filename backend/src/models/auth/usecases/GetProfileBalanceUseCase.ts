import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import type { GetProfileBalanceRepository } from '../infra/repositories/GetProfileBalanceRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';

export interface GetProfileBalanceInput {
  profileId: string;
}

export interface GetProfileBalanceOutput {
  profileId: string;
  storedBalance: string;
  calculatedBalance: string;
  balance: string; // The stored balance (for consistency)
}

/**
 * Use case for getting profile balance.
 * Returns both stored balance and calculated balance from accounts for validation.
 */
export class GetProfileBalanceUseCase
  implements IService<GetProfileBalanceInput, GetProfileBalanceOutput>
{
  private readonly logger: ILogger;
  private readonly getProfileRepository: GetProfileRepository;
  private readonly getProfileBalanceRepository: GetProfileBalanceRepository;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.getProfileBalanceRepository]: GetProfileBalanceRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.getProfileRepository = opts[AppProviders.getProfileRepository];
    this.getProfileBalanceRepository = opts[AppProviders.getProfileBalanceRepository];
  }

  /**
   * Executes the get profile balance use case.
   *
   * @param input - The input data containing profileId
   * @returns The balance data (stored and calculated)
   * @throws {NotFoundError} If profile is not found
   */
  public async execute(input: GetProfileBalanceInput): Promise<GetProfileBalanceOutput> {
    this.logger.info(
      {
        profileId: input.profileId,
      },
      'get_profile_balance:start',
      GetProfileBalanceUseCase.name,
    );

    // Get profile to access stored balance
    const profile = await this.getProfileRepository.findById({
      profileId: input.profileId,
    });

    if (!profile) {
      throw new NotFoundError({
        message: `Profile with ID ${input.profileId} not found`,
      });
    }

    // Calculate balance from accounts
    const calculatedBalance = await this.getProfileBalanceRepository.calculateBalance({
      profileId: input.profileId,
      tenantId: profile.tenantId,
    });

    this.logger.info(
      {
        profileId: input.profileId,
        storedBalance: profile.balance.toString(),
        calculatedBalance: calculatedBalance.toString(),
      },
      'get_profile_balance:success',
      GetProfileBalanceUseCase.name,
    );

    return {
      profileId: input.profileId,
      storedBalance: profile.balance.toString(),
      calculatedBalance: calculatedBalance.toString(),
      balance: profile.balance.toString(), // Return stored balance as primary value
    };
  }
}

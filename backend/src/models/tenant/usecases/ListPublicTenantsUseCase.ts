import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { ListPublicTenantsRepository } from '../infra/repositories/ListPublicTenantsRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ListPublicTenantsResponse } from '../dtos/ListPublicTenants.dto';

export type ListPublicTenantsInput = Record<string, never>;

export type ListPublicTenantsOutput = ListPublicTenantsResponse;

/**
 * Use case for listing public tenants (non-deleted tenants).
 * This is a public endpoint that does not require authentication.
 * Returns only id and name for simplicity.
 */
export class ListPublicTenantsUseCase
  implements IService<ListPublicTenantsInput, ListPublicTenantsOutput>
{
  private readonly logger: ILogger;
  private readonly listPublicTenantsRepository: ListPublicTenantsRepository;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listPublicTenantsRepository]: ListPublicTenantsRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listPublicTenantsRepository = opts[AppProviders.listPublicTenantsRepository];
  }

  /**
   * Executes the list public tenants use case.
   * Lists all non-deleted tenants without requiring authentication.
   *
   * @param _input - Empty input (public endpoint)
   * @returns List of public tenants with id and name only
   */
  public async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: ListPublicTenantsInput = {} as ListPublicTenantsInput,
  ): Promise<ListPublicTenantsOutput> {
    this.logger.info({}, 'list_public_tenants:start', ListPublicTenantsUseCase.name);

    const tenants = await this.listPublicTenantsRepository.listPublic();

    this.logger.info(
      {
        tenantCount: tenants.length,
      },
      'list_public_tenants:success',
      ListPublicTenantsUseCase.name,
    );

    return {
      tenants: tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
      })),
    };
  }
}

import type { ListLedgerEntriesFilters } from '../../infra/repositories/ListLedgerEntriesRepository';
import { QueryParameterConverter } from './QueryParameterConverter';

/**
 * Helper service for building filter objects for listing ledger entries.
 * Follows SRP by handling only filter construction logic.
 */
export class ListLedgerEntriesFiltersBuilder {
  /**
   * Builds a filter object from input parameters.
   *
   * @param input - Input parameters containing tenantId and optional filters
   * @returns Filter object for repository query
   */
  public static build(input: {
    tenantId: string;
    status?: 'PENDING' | 'COMPLETED' | 'FAILED';
    type?: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
    dateFrom?: unknown;
    dateTo?: unknown;
    accountIds?: string[];
  }): ListLedgerEntriesFilters {
    return {
      tenantId: input.tenantId,
      status: input.status,
      type: input.type,
      dateFrom: QueryParameterConverter.toDate(input.dateFrom),
      dateTo: QueryParameterConverter.toDate(input.dateTo),
      accountIds: input.accountIds,
    };
  }
}

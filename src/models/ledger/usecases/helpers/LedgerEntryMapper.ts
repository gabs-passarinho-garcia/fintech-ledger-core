import type { LedgerEntry } from '../../domain/LedgerEntry.entity';
import type { ListLedgerEntriesResponse } from '../../dtos/ListLedgerEntries.dto';

type LedgerEntryDto = ListLedgerEntriesResponse['entries'][number];

/**
 * Helper service for mapping domain entities to DTOs.
 * Follows SRP by handling only data transformation.
 */
export class LedgerEntryMapper {
  /**
   * Maps a single LedgerEntry entity to the response DTO format.
   *
   * @param entry - The ledger entry entity
   * @returns The mapped entry DTO
   */
  public static toDto(entry: LedgerEntry): LedgerEntryDto {
    return {
      id: entry.id,
      tenantId: entry.tenantId,
      fromAccountId: entry.fromAccountId,
      toAccountId: entry.toAccountId,
      amount: entry.amount.toString(),
      type: entry.type,
      status: entry.status,
      createdBy: entry.createdBy,
      createdAt: entry.createdAt,
      updatedBy: entry.updatedBy,
      updatedAt: entry.updatedAt,
    };
  }

  /**
   * Maps an array of LedgerEntry entities to the response DTO format.
   *
   * @param entries - Array of ledger entry entities
   * @returns Array of mapped entry DTOs
   */
  public static toDtoArray(entries: LedgerEntry[]): LedgerEntryDto[] {
    return entries.map((entry) => this.toDto(entry));
  }
}

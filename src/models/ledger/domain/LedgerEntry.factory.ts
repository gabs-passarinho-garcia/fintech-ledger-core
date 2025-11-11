import { Decimal } from 'decimal.js';
import { uuidv7 } from 'uuidv7';
import { LedgerEntry, type TransactionType, type LedgerEntryStatus } from './LedgerEntry.entity';

export interface CreateLedgerEntryInput {
  tenantId: string;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  amount: number | string | Decimal;
  type: TransactionType;
  createdBy: string;
}

/**
 * Factory for creating LedgerEntry entities.
 * Encapsulates the creation logic and ensures proper initialization.
 */
export class LedgerEntryFactory {
  /**
   * Creates a new LedgerEntry entity.
   *
   * @param input - The input data for creating the ledger entry
   * @returns A new LedgerEntry instance
   */
  public static create(input: CreateLedgerEntryInput): LedgerEntry {
    const now = new Date();
    const amount = input.amount instanceof Decimal ? input.amount : new Decimal(input.amount);

    return LedgerEntry.create({
      id: uuidv7(),
      tenantId: input.tenantId,
      fromAccountId: input.fromAccountId ?? null,
      toAccountId: input.toAccountId ?? null,
      amount,
      type: input.type,
      status: 'PENDING',
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      updatedBy: null,
      deletedBy: null,
      deletedAt: null,
    });
  }

  /**
   * Reconstructs a LedgerEntry entity from database data.
   *
   * @param data - The database data
   * @returns A LedgerEntry instance
   */
  public static reconstruct(data: {
    id: string;
    tenantId: string;
    fromAccountId?: string | null;
    toAccountId?: string | null;
    amount: Decimal | string | number;
    type: TransactionType;
    status: LedgerEntryStatus;
    createdBy: string;
    createdAt: Date;
    updatedBy?: string | null;
    updatedAt: Date;
    deletedBy?: string | null;
    deletedAt?: Date | null;
  }): LedgerEntry {
    const amount = data.amount instanceof Decimal ? data.amount : new Decimal(data.amount);

    return LedgerEntry.reconstruct({
      id: data.id,
      tenantId: data.tenantId,
      fromAccountId: data.fromAccountId ?? null,
      toAccountId: data.toAccountId ?? null,
      amount,
      type: data.type,
      status: data.status,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedBy: data.updatedBy ?? null,
      updatedAt: data.updatedAt,
      deletedBy: data.deletedBy ?? null,
      deletedAt: data.deletedAt ?? null,
    });
  }
}

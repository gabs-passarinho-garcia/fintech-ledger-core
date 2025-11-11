import { Decimal } from 'decimal.js';
import { DomainError } from '@/common/errors';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
export type LedgerEntryStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface LedgerEntryProps {
  id: string;
  tenantId: string;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  amount: Decimal;
  type: TransactionType;
  status: LedgerEntryStatus;
  createdBy: string;
  createdAt: Date;
  updatedBy?: string | null;
  updatedAt: Date;
  deletedBy?: string | null;
  deletedAt?: Date | null;
}

/**
 * LedgerEntry entity represents a financial transaction entry in the ledger.
 * This entity encapsulates business rules for ledger entries and ensures data integrity.
 */
export class LedgerEntry {
  public readonly id: string;
  public readonly tenantId: string;
  public readonly fromAccountId?: string | null;
  public readonly toAccountId?: string | null;
  public readonly amount: Decimal;
  public readonly type: TransactionType;
  public status: LedgerEntryStatus;
  public readonly createdBy: string;
  public readonly createdAt: Date;
  public updatedBy?: string | null;
  public updatedAt: Date;
  public deletedBy?: string | null;
  public deletedAt?: Date | null;

  /**
   * Creates a new LedgerEntry instance.
   * Private constructor - use LedgerEntryFactory to create instances.
   *
   * @param props - The properties of the ledger entry
   */
  private constructor(props: LedgerEntryProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.fromAccountId = props.fromAccountId;
    this.toAccountId = props.toAccountId;
    this.amount = props.amount;
    this.type = props.type;
    this.status = props.status;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedBy = props.updatedBy;
    this.updatedAt = props.updatedAt;
    this.deletedBy = props.deletedBy;
    this.deletedAt = props.deletedAt;
  }

  /**
   * Validates the ledger entry according to business rules.
   *
   * @throws {DomainError} If validation fails
   */
  public validate(): void {
    // Amount must be positive
    if (this.amount.lessThanOrEqualTo(0)) {
      throw new DomainError({
        message: 'Ledger entry amount must be greater than zero',
      });
    }

    // Transfer transactions require both accounts
    if (this.type === 'TRANSFER') {
      if (!this.fromAccountId || !this.toAccountId) {
        throw new DomainError({
          message: 'Transfer transactions require both fromAccountId and toAccountId',
        });
      }

      if (this.fromAccountId === this.toAccountId) {
        throw new DomainError({
          message: 'Transfer transactions cannot have the same fromAccountId and toAccountId',
        });
      }
    }

    // Deposit and Withdrawal require appropriate account
    if (this.type === 'DEPOSIT' && !this.toAccountId) {
      throw new DomainError({
        message: 'Deposit transactions require toAccountId',
      });
    }

    if (this.type === 'WITHDRAWAL' && !this.fromAccountId) {
      throw new DomainError({
        message: 'Withdrawal transactions require fromAccountId',
      });
    }
  }

  /**
   * Marks the ledger entry as completed.
   */
  public markAsCompleted(updatedBy: string): void {
    if (this.status === 'COMPLETED') {
      throw new DomainError({
        message: 'Ledger entry is already completed',
      });
    }

    this.status = 'COMPLETED';
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  /**
   * Marks the ledger entry as failed.
   *
   * @param updatedBy - The user who is marking the entry as failed
   */
  public markAsFailed(updatedBy: string): void {
    if (this.status === 'FAILED') {
      throw new DomainError({
        message: 'Ledger entry is already marked as failed',
      });
    }

    this.status = 'FAILED';
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  /**
   * Creates a new LedgerEntry instance from properties.
   * This method is used by the factory for object creation.
   *
   * @param props - The properties of the ledger entry
   * @returns A new LedgerEntry instance
   */
  public static create(props: LedgerEntryProps): LedgerEntry {
    const entry = new LedgerEntry(props);
    entry.validate();
    return entry;
  }

  /**
   * Reconstructs a LedgerEntry instance from database data.
   * This method is used by repositories to reconstruct entities from persistence.
   *
   * @param props - The properties of the ledger entry
   * @returns A LedgerEntry instance
   */
  public static reconstruct(props: LedgerEntryProps): LedgerEntry {
    return new LedgerEntry(props);
  }
}

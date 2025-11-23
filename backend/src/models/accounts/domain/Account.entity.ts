import { Decimal } from 'decimal.js';
import { DomainError } from '@/common/errors';

export interface AccountProps {
  id: string;
  tenantId: string;
  profileId: string | null;
  name: string;
  balance: Decimal | string | number;
  createdBy: string;
  createdAt: Date;
  updatedBy?: string | null;
  updatedAt: Date;
  deletedBy?: string | null;
  deletedAt?: Date | null;
}

/**
 * Account entity represents a financial account linked to a profile and tenant.
 * An account belongs to a profile and can have multiple ledger entries.
 * This entity encapsulates business rules for accounts and ensures data integrity.
 */
export class Account {
  public readonly id: string;
  public readonly tenantId: string;
  public readonly profileId: string | null;
  public readonly name: string;
  public readonly balance: Decimal;
  public readonly createdBy: string;
  public readonly createdAt: Date;
  public updatedBy?: string | null;
  public readonly updatedAt: Date;
  public deletedBy?: string | null;
  public deletedAt?: Date | null;

  /**
   * Creates a new Account instance.
   * Private constructor - use AccountFactory to create instances.
   *
   * @param props - The properties of the account
   */
  private constructor(props: AccountProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.profileId = props.profileId;
    this.name = props.name;
    this.balance =
      props.balance instanceof Decimal ? props.balance : new Decimal(props.balance ?? 0);
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedBy = props.updatedBy ?? null;
    this.updatedAt = props.updatedAt;
    this.deletedBy = props.deletedBy ?? null;
    this.deletedAt = props.deletedAt ?? null;
  }

  /**
   * Validates the account according to business rules.
   *
   * @throws {DomainError} If validation fails
   */
  public validate(): void {
    // Name must not be empty
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainError({
        message: 'Account name cannot be empty',
      });
    }

    // Name must have minimum length
    if (this.name.trim().length < 2) {
      throw new DomainError({
        message: 'Account name must be at least 2 characters long',
      });
    }

    // Balance must be a valid number
    if (this.balance.isNaN()) {
      throw new DomainError({
        message: 'Account balance must be a valid number',
      });
    }

    // Tenant ID must not be empty
    if (!this.tenantId || this.tenantId.trim().length === 0) {
      throw new DomainError({
        message: 'Tenant ID cannot be empty',
      });
    }

    // Created by must not be empty
    if (!this.createdBy || this.createdBy.trim().length === 0) {
      throw new DomainError({
        message: 'Created by cannot be empty',
      });
    }
  }

  /**
   * Creates a new Account instance from properties.
   * This method is used by the factory for object creation.
   *
   * @param props - The properties of the account
   * @returns A new Account instance
   */
  public static create(props: AccountProps): Account {
    const account = new Account(props);
    account.validate();
    return account;
  }

  /**
   * Reconstructs an Account instance from database data.
   * This method is used by repositories to reconstruct entities from persistence.
   *
   * @param props - The properties of the account
   * @returns An Account instance
   */
  public static reconstruct(props: AccountProps): Account {
    return new Account(props);
  }
}

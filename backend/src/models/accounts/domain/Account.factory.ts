import { Decimal } from 'decimal.js';
import { uuidv7 } from 'uuidv7';
import { Account } from './Account.entity';

export interface CreateAccountInput {
  tenantId: string;
  profileId: string | null;
  name: string;
  balance?: Decimal | string | number;
  createdBy: string;
}

/**
 * Factory for creating Account entities.
 * Encapsulates the creation logic and ensures proper initialization.
 */
export class AccountFactory {
  /**
   * Creates a new Account entity.
   *
   * @param input - The input data for creating the account
   * @returns A new Account instance
   */
  public static create(input: CreateAccountInput): Account {
    const now = new Date();

    return Account.create({
      id: uuidv7(),
      tenantId: input.tenantId,
      profileId: input.profileId,
      name: input.name.trim(),
      balance: input.balance ?? 0,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      updatedBy: null,
      deletedBy: null,
      deletedAt: null,
    });
  }

  /**
   * Reconstructs an Account entity from database data.
   *
   * @param data - The database data
   * @returns An Account instance
   */
  public static reconstruct(data: {
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
  }): Account {
    return Account.reconstruct({
      id: data.id,
      tenantId: data.tenantId,
      profileId: data.profileId,
      name: data.name,
      balance: data.balance,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedBy: data.updatedBy ?? null,
      updatedAt: data.updatedAt,
      deletedBy: data.deletedBy ?? null,
      deletedAt: data.deletedAt ?? null,
    });
  }
}

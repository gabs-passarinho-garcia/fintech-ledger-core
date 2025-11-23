import { Decimal } from 'decimal.js';
import { uuidv7 } from 'uuidv7';
import { Profile } from './Profile.entity';

export interface CreateProfileInput {
  userId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  balance?: Decimal | string | number;
}

/**
 * Factory for creating Profile entities.
 * Encapsulates the creation logic and ensures proper initialization.
 */
export class ProfileFactory {
  /**
   * Creates a new Profile entity.
   *
   * @param input - The input data for creating the profile
   * @returns A new Profile instance
   */
  public static create(input: CreateProfileInput): Profile {
    const now = new Date();

    return Profile.create({
      id: uuidv7(),
      userId: input.userId,
      tenantId: input.tenantId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      balance: input.balance ?? 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  /**
   * Reconstructs a Profile entity from database data.
   *
   * @param data - The database data
   * @returns A Profile instance
   */
  public static reconstruct(data: {
    id: string;
    userId: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    email: string;
    balance: Decimal | string | number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
  }): Profile {
    return Profile.reconstruct({
      id: data.id,
      userId: data.userId,
      tenantId: data.tenantId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      balance: data.balance,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt ?? null,
    });
  }
}

import { uuidv7 } from 'uuidv7';
import { User } from './User.entity';

export interface CreateUserInput {
  username: string;
  passwordHash: string;
  isMaster?: boolean;
}

/**
 * Factory for creating User entities.
 * Encapsulates the creation logic and ensures proper initialization.
 */
export class UserFactory {
  /**
   * Creates a new User entity.
   *
   * @param input - The input data for creating the user
   * @returns A new User instance
   */
  public static create(input: CreateUserInput): User {
    const now = new Date();

    return User.create({
      id: uuidv7(),
      username: input.username.trim(),
      passwordHash: input.passwordHash,
      isMaster: input.isMaster ?? false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  /**
   * Reconstructs a User entity from database data.
   *
   * @param data - The database data
   * @returns A User instance
   */
  public static reconstruct(data: {
    id: string;
    username: string;
    passwordHash: string;
    isMaster: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
  }): User {
    return User.reconstruct({
      id: data.id,
      username: data.username,
      passwordHash: data.passwordHash,
      isMaster: data.isMaster,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt ?? null,
    });
  }
}

import { DomainError } from '@/common/errors';

export interface UserProps {
  id: string;
  username: string;
  passwordHash: string;
  isMaster: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * User entity represents a user account in the system.
 * This entity encapsulates business rules for user accounts and ensures data integrity.
 */
export class User {
  public readonly id: string;
  public readonly username: string;
  public readonly passwordHash: string;
  public readonly isMaster: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public deletedAt?: Date | null;

  /**
   * Creates a new User instance.
   * Private constructor - use UserFactory to create instances.
   *
   * @param props - The properties of the user
   */
  private constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.passwordHash = props.passwordHash;
    this.isMaster = props.isMaster;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  /**
   * Validates the user according to business rules.
   *
   * @throws {DomainError} If validation fails
   */
  public validate(): void {
    // Username must not be empty
    if (!this.username || this.username.trim().length === 0) {
      throw new DomainError({
        message: 'Username cannot be empty',
      });
    }

    // Username must be at least 3 characters
    if (this.username.length < 3) {
      throw new DomainError({
        message: 'Username must be at least 3 characters long',
      });
    }

    // Username must contain only alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      throw new DomainError({
        message: 'Username can only contain alphanumeric characters and underscores',
      });
    }

    // Password hash must not be empty
    if (!this.passwordHash || this.passwordHash.trim().length === 0) {
      throw new DomainError({
        message: 'Password hash cannot be empty',
      });
    }
  }

  /**
   * Creates a new User instance from properties.
   * This method is used by the factory for object creation.
   *
   * @param props - The properties of the user
   * @returns A new User instance
   */
  public static create(props: UserProps): User {
    const user = new User(props);
    user.validate();
    return user;
  }

  /**
   * Reconstructs a User instance from database data.
   * This method is used by repositories to reconstruct entities from persistence.
   *
   * @param props - The properties of the user
   * @returns A User instance
   */
  public static reconstruct(props: UserProps): User {
    return new User(props);
  }
}

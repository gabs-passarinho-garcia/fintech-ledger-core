import { DomainError } from '@/common/errors';

export interface ProfileProps {
  id: string;
  userId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Profile entity represents a user profile linked to a tenant.
 * A user can have multiple profiles (one per tenant).
 * This entity encapsulates business rules for profiles and ensures data integrity.
 */
export class Profile {
  public readonly id: string;
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public deletedAt?: Date | null;

  /**
   * Creates a new Profile instance.
   * Private constructor - use ProfileFactory to create instances.
   *
   * @param props - The properties of the profile
   */
  private constructor(props: ProfileProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  /**
   * Validates the profile according to business rules.
   *
   * @throws {DomainError} If validation fails
   */
  public validate(): void {
    // First name must not be empty
    if (!this.firstName || this.firstName.trim().length === 0) {
      throw new DomainError({
        message: 'First name cannot be empty',
      });
    }

    // Last name must not be empty
    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new DomainError({
        message: 'Last name cannot be empty',
      });
    }

    // Email must not be empty
    if (!this.email || this.email.trim().length === 0) {
      throw new DomainError({
        message: 'Email cannot be empty',
      });
    }

    // Email must be valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new DomainError({
        message: 'Email must be in a valid format',
      });
    }
  }

  /**
   * Creates a new Profile instance from properties.
   * This method is used by the factory for object creation.
   *
   * @param props - The properties of the profile
   * @returns A new Profile instance
   */
  public static create(props: ProfileProps): Profile {
    const profile = new Profile(props);
    profile.validate();
    return profile;
  }

  /**
   * Reconstructs a Profile instance from database data.
   * This method is used by repositories to reconstruct entities from persistence.
   *
   * @param props - The properties of the profile
   * @returns A Profile instance
   */
  public static reconstruct(props: ProfileProps): Profile {
    return new Profile(props);
  }
}

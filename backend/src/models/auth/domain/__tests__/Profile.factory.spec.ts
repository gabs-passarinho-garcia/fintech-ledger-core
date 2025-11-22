import { describe, it, expect } from 'bun:test';
import { ProfileFactory } from '../Profile.factory';
import { DomainError } from '@/common/errors';

describe('ProfileFactory', () => {
  const setup = () => {
    const validInput = {
      userId: 'user-123',
      tenantId: 'tenant-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    return { validInput };
  };

  describe('create', () => {
    it('should create a profile with valid input', () => {
      const { validInput } = setup();
      const profile = ProfileFactory.create(validInput);

      expect(profile.id).toBeDefined();
      expect(profile.userId).toBe('user-123');
      expect(profile.tenantId).toBe('tenant-123');
      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.email).toBe('john.doe@example.com');
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
      expect(profile.deletedAt).toBeNull();
    });

    it('should trim first name whitespace', () => {
      const { validInput } = setup();
      const profile = ProfileFactory.create({ ...validInput, firstName: '  John  ' });

      expect(profile.firstName).toBe('John');
    });

    it('should trim last name whitespace', () => {
      const { validInput } = setup();
      const profile = ProfileFactory.create({ ...validInput, lastName: '  Doe  ' });

      expect(profile.lastName).toBe('Doe');
    });

    it('should trim and lowercase email', () => {
      const { validInput } = setup();
      const profile = ProfileFactory.create({ ...validInput, email: '  JOHN.DOE@EXAMPLE.COM  ' });

      expect(profile.email).toBe('john.doe@example.com');
    });

    it('should throw DomainError for invalid email', () => {
      const { validInput } = setup();
      expect(() => {
        ProfileFactory.create({ ...validInput, email: 'invalid-email' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for empty first name', () => {
      const { validInput } = setup();
      expect(() => {
        ProfileFactory.create({ ...validInput, firstName: '' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for empty last name', () => {
      const { validInput } = setup();
      expect(() => {
        ProfileFactory.create({ ...validInput, lastName: '' });
      }).toThrow(DomainError);
    });

    it('should generate unique IDs for different profiles', () => {
      const { validInput } = setup();
      const profile1 = ProfileFactory.create(validInput);
      const profile2 = ProfileFactory.create({ ...validInput, email: 'other@example.com' });

      expect(profile1.id).not.toBe(profile2.id);
    });

    it('should set createdAt and updatedAt to current time', () => {
      const { validInput } = setup();
      const before = new Date();
      const profile = ProfileFactory.create(validInput);
      const after = new Date();

      expect(profile.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(profile.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(profile.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(profile.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct profile from database data', () => {
      const dbData = {
        id: 'db-profile-123',
        userId: 'db-user-123',
        tenantId: 'db-tenant-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      };

      const profile = ProfileFactory.reconstruct(dbData);

      expect(profile.id).toBe('db-profile-123');
      expect(profile.userId).toBe('db-user-123');
      expect(profile.tenantId).toBe('db-tenant-123');
      expect(profile.firstName).toBe('Jane');
      expect(profile.lastName).toBe('Smith');
      expect(profile.email).toBe('jane.smith@example.com');
      expect(profile.createdAt).toEqual(new Date('2024-01-01'));
      expect(profile.updatedAt).toEqual(new Date('2024-01-02'));
      expect(profile.deletedAt).toBeNull();
    });

    it('should reconstruct profile with deletedAt set', () => {
      const deletedAt = new Date('2024-01-03');
      const dbData = {
        id: 'db-profile-123',
        userId: 'db-user-123',
        tenantId: 'db-tenant-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt,
      };

      const profile = ProfileFactory.reconstruct(dbData);

      expect(profile.deletedAt).toEqual(deletedAt);
    });

    it('should default deletedAt to null when not provided', () => {
      const dbData = {
        id: 'db-profile-123',
        userId: 'db-user-123',
        tenantId: 'db-tenant-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const profile = ProfileFactory.reconstruct(dbData);

      expect(profile.deletedAt).toBeNull();
    });
  });
});


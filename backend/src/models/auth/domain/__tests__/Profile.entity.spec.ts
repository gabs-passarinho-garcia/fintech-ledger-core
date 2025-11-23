import { describe, it, expect } from 'bun:test';
import { Profile } from '../Profile.entity';
import { ProfileFactory } from '../Profile.factory';
import { DomainError } from '@/common/errors';

describe('Profile Entity', () => {
  const setup = () => {
    const validProps = {
      id: 'profile-123',
      userId: 'user-123',
      tenantId: 'tenant-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    return { validProps };
  };

  describe('Profile.create', () => {
    it('should create a valid profile with all required properties', () => {
      const { validProps } = setup();
      const profile = Profile.create(validProps);

      expect(profile.id).toBe('profile-123');
      expect(profile.userId).toBe('user-123');
      expect(profile.tenantId).toBe('tenant-123');
      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.email).toBe('john.doe@example.com');
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
      expect(profile.deletedAt).toBeNull();
    });

    it('should throw DomainError for empty first name', () => {
      const { validProps } = setup();
      expect(() => {
        Profile.create({ ...validProps, firstName: '' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for first name with only whitespace', () => {
      const { validProps } = setup();
      expect(() => {
        Profile.create({ ...validProps, firstName: '   ' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for empty last name', () => {
      const { validProps } = setup();
      expect(() => {
        Profile.create({ ...validProps, lastName: '' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for last name with only whitespace', () => {
      const { validProps } = setup();
      expect(() => {
        Profile.create({ ...validProps, lastName: '   ' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for empty email', () => {
      const { validProps } = setup();
      expect(() => {
        Profile.create({ ...validProps, email: '' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for email with only whitespace', () => {
      const { validProps } = setup();
      expect(() => {
        Profile.create({ ...validProps, email: '   ' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for invalid email format', () => {
      const { validProps } = setup();
      expect(() => {
        Profile.create({ ...validProps, email: 'invalid-email' });
      }).toThrow(DomainError);

      expect(() => {
        Profile.create({ ...validProps, email: 'invalid@email' });
      }).toThrow(DomainError);

      expect(() => {
        Profile.create({ ...validProps, email: '@example.com' });
      }).toThrow(DomainError);

      expect(() => {
        Profile.create({ ...validProps, email: 'user@' });
      }).toThrow(DomainError);
    });

    it('should accept valid email formats', () => {
      const { validProps } = setup();
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
      ];

      validEmails.forEach((email) => {
        const profile = Profile.create({ ...validProps, email });
        expect(profile.email).toBe(email);
      });
    });
  });

  describe('Profile.reconstruct', () => {
    it('should reconstruct profile from database data without validation', () => {
      const { validProps } = setup();
      const profile = Profile.reconstruct(validProps);

      expect(profile.id).toBe('profile-123');
      expect(profile.userId).toBe('user-123');
      expect(profile.tenantId).toBe('tenant-123');
      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.email).toBe('john.doe@example.com');
    });

    it('should reconstruct profile with deletedAt set', () => {
      const { validProps } = setup();
      const deletedAt = new Date();
      const profile = Profile.reconstruct({ ...validProps, deletedAt });

      expect(profile.deletedAt).toEqual(deletedAt);
    });
  });

  describe('Profile.validate', () => {
    it('should validate a valid profile', () => {
      const { validProps } = setup();
      const profile = Profile.create(validProps);

      expect(() => {
        profile.validate();
      }).not.toThrow();
    });

    it('should throw DomainError when email is invalid', () => {
      const { validProps } = setup();
      const profile = Profile.reconstruct({ ...validProps, email: 'invalid' });

      expect(() => {
        profile.validate();
      }).toThrow(DomainError);
    });
  });

  describe('ProfileFactory integration', () => {
    it('should create profile via factory', () => {
      const profile = ProfileFactory.create({
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      });

      expect(profile.id).toBeDefined();
      expect(profile.userId).toBe('user-123');
      expect(profile.tenantId).toBe('tenant-123');
      expect(profile.firstName).toBe('Jane');
      expect(profile.lastName).toBe('Smith');
      expect(profile.email).toBe('jane.smith@example.com');
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should trim and lowercase email when creating via factory', () => {
      const profile = ProfileFactory.create({
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: '  JANE.SMITH@EXAMPLE.COM  ',
      });

      expect(profile.email).toBe('jane.smith@example.com');
    });

    it('should trim first name and last name when creating via factory', () => {
      const profile = ProfileFactory.create({
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: '  Jane  ',
        lastName: '  Smith  ',
        email: 'jane@example.com',
      });

      expect(profile.firstName).toBe('Jane');
      expect(profile.lastName).toBe('Smith');
    });
  });

  describe('Profile relationships', () => {
    it('should link profile to user and tenant', () => {
      const { validProps } = setup();
      const profile = Profile.create(validProps);

      expect(profile.userId).toBe('user-123');
      expect(profile.tenantId).toBe('tenant-123');
    });

    it('should allow multiple profiles for same user with different tenants', () => {
      const profile1 = ProfileFactory.create({
        userId: 'user-123',
        tenantId: 'tenant-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@tenant1.com',
      });

      const profile2 = ProfileFactory.create({
        userId: 'user-123',
        tenantId: 'tenant-2',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@tenant2.com',
      });

      expect(profile1.userId).toBe(profile2.userId);
      expect(profile1.tenantId).not.toBe(profile2.tenantId);
      expect(profile1.id).not.toBe(profile2.id);
    });
  });
});


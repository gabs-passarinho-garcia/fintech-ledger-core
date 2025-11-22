import { describe, it, expect } from 'bun:test';
import { User } from '../User.entity';
import { UserFactory } from '../User.factory';
import { DomainError } from '@/common/errors';

describe('User Entity', () => {
  const setup = () => {
    const validProps = {
      id: 'user-123',
      username: 'testuser',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
      isMaster: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    return { validProps };
  };

  describe('User.create', () => {
    it('should create a valid user with all required properties', () => {
      const { validProps } = setup();
      const user = User.create(validProps);

      expect(user.id).toBe('user-123');
      expect(user.username).toBe('testuser');
      expect(user.passwordHash).toBe(validProps.passwordHash);
      expect(user.isMaster).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.deletedAt).toBeNull();
    });

    it('should create a master user when isMaster is true', () => {
      const { validProps } = setup();
      const user = User.create({ ...validProps, isMaster: true });

      expect(user.isMaster).toBe(true);
    });

    it('should throw DomainError for empty username', () => {
      const { validProps } = setup();
      expect(() => {
        User.create({ ...validProps, username: '' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for username with only whitespace', () => {
      const { validProps } = setup();
      expect(() => {
        User.create({ ...validProps, username: '   ' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for username shorter than 3 characters', () => {
      const { validProps } = setup();
      expect(() => {
        User.create({ ...validProps, username: 'ab' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for username with invalid characters', () => {
      const { validProps } = setup();
      expect(() => {
        User.create({ ...validProps, username: 'user-name' });
      }).toThrow(DomainError);

      expect(() => {
        User.create({ ...validProps, username: 'user name' });
      }).toThrow(DomainError);

      expect(() => {
        User.create({ ...validProps, username: 'user@name' });
      }).toThrow(DomainError);
    });

    it('should accept username with alphanumeric characters and underscores', () => {
      const { validProps } = setup();
      const user1 = User.create({ ...validProps, username: 'user123' });
      const user2 = User.create({ ...validProps, username: 'user_name' });
      const user3 = User.create({ ...validProps, username: 'User123_Name' });

      expect(user1.username).toBe('user123');
      expect(user2.username).toBe('user_name');
      expect(user3.username).toBe('User123_Name');
    });

    it('should throw DomainError for empty password hash', () => {
      const { validProps } = setup();
      expect(() => {
        User.create({ ...validProps, passwordHash: '' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for password hash with only whitespace', () => {
      const { validProps } = setup();
      expect(() => {
        User.create({ ...validProps, passwordHash: '   ' });
      }).toThrow(DomainError);
    });
  });

  describe('User.reconstruct', () => {
    it('should reconstruct user from database data without validation', () => {
      const { validProps } = setup();
      const user = User.reconstruct(validProps);

      expect(user.id).toBe('user-123');
      expect(user.username).toBe('testuser');
      expect(user.passwordHash).toBe(validProps.passwordHash);
    });

    it('should reconstruct user with deletedAt set', () => {
      const { validProps } = setup();
      const deletedAt = new Date();
      const user = User.reconstruct({ ...validProps, deletedAt });

      expect(user.deletedAt).toEqual(deletedAt);
    });
  });

  describe('User.validate', () => {
    it('should validate a valid user', () => {
      const { validProps } = setup();
      const user = User.create(validProps);

      expect(() => {
        user.validate();
      }).not.toThrow();
    });

    it('should throw DomainError when username is invalid', () => {
      const { validProps } = setup();
      const user = User.reconstruct({ ...validProps, username: 'ab' });

      expect(() => {
        user.validate();
      }).toThrow(DomainError);
    });
  });

  describe('UserFactory integration', () => {
    it('should create user via factory', () => {
      const user = UserFactory.create({
        username: 'factoryuser',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        isMaster: false,
      });

      expect(user.id).toBeDefined();
      expect(user.username).toBe('factoryuser');
      expect(user.isMaster).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create master user via factory', () => {
      const user = UserFactory.create({
        username: 'masteruser',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        isMaster: true,
      });

      expect(user.isMaster).toBe(true);
    });

    it('should trim username when creating via factory', () => {
      const user = UserFactory.create({
        username: '  trimmeduser  ',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
      });

      expect(user.username).toBe('trimmeduser');
    });
  });
});


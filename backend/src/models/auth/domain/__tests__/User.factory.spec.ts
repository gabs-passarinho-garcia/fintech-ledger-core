import { describe, it, expect } from 'bun:test';
import { UserFactory } from '../User.factory';
import { DomainError } from '@/common/errors';

describe('UserFactory', () => {
  const setup = () => {
    const validInput = {
      username: 'testuser',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
      isMaster: false,
    };

    return { validInput };
  };

  describe('create', () => {
    it('should create a user with valid input', () => {
      const { validInput } = setup();
      const user = UserFactory.create(validInput);

      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.passwordHash).toBe(validInput.passwordHash);
      expect(user.isMaster).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.deletedAt).toBeNull();
    });

    it('should create a master user when isMaster is true', () => {
      const { validInput } = setup();
      const user = UserFactory.create({ ...validInput, isMaster: true });

      expect(user.isMaster).toBe(true);
    });

    it('should default isMaster to false when not provided', () => {
      const { validInput } = setup();
      const { isMaster, ...inputWithoutMaster } = validInput;
      const user = UserFactory.create(inputWithoutMaster);

      expect(user.isMaster).toBe(false);
    });

    it('should trim username whitespace', () => {
      const { validInput } = setup();
      const user = UserFactory.create({ ...validInput, username: '  trimmed  ' });

      expect(user.username).toBe('trimmed');
    });

    it('should throw DomainError for invalid username', () => {
      const { validInput } = setup();
      expect(() => {
        UserFactory.create({ ...validInput, username: 'ab' });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for empty password hash', () => {
      const { validInput } = setup();
      expect(() => {
        UserFactory.create({ ...validInput, passwordHash: '' });
      }).toThrow(DomainError);
    });

    it('should generate unique IDs for different users', () => {
      const { validInput } = setup();
      const user1 = UserFactory.create(validInput);
      const user2 = UserFactory.create({ ...validInput, username: 'user2' });

      expect(user1.id).not.toBe(user2.id);
    });

    it('should set createdAt and updatedAt to current time', () => {
      const { validInput } = setup();
      const before = new Date();
      const user = UserFactory.create(validInput);
      const after = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct user from database data', () => {
      const dbData = {
        id: 'db-user-123',
        username: 'dbuser',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        isMaster: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      };

      const user = UserFactory.reconstruct(dbData);

      expect(user.id).toBe('db-user-123');
      expect(user.username).toBe('dbuser');
      expect(user.passwordHash).toBe(dbData.passwordHash);
      expect(user.isMaster).toBe(true);
      expect(user.createdAt).toEqual(new Date('2024-01-01'));
      expect(user.updatedAt).toEqual(new Date('2024-01-02'));
      expect(user.deletedAt).toBeNull();
    });

    it('should reconstruct user with deletedAt set', () => {
      const deletedAt = new Date('2024-01-03');
      const dbData = {
        id: 'db-user-123',
        username: 'dbuser',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        isMaster: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt,
      };

      const user = UserFactory.reconstruct(dbData);

      expect(user.deletedAt).toEqual(deletedAt);
    });

    it('should default deletedAt to null when not provided', () => {
      const dbData = {
        id: 'db-user-123',
        username: 'dbuser',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        isMaster: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const user = UserFactory.reconstruct(dbData);

      expect(user.deletedAt).toBeNull();
    });
  });
});


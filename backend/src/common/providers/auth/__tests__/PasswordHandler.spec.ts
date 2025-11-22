import { describe, it, expect, mock } from 'bun:test';
import { PasswordHandler } from '../PasswordHandler';
import { Logger } from '../../Logger';
import { DomainError } from '@/common/errors';

describe('PasswordHandler', () => {
  const setup = () => {
    const mockLogger = {
      setService: mock(() => mockLogger),
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
    } as unknown as Logger;

    const passwordHandler = new PasswordHandler({
      logger: mockLogger,
    });

    return { passwordHandler, mockLogger };
  };

  describe('hash', () => {
    it('should hash a valid password', async () => {
      const { passwordHandler } = setup();
      const password = 'SecurePassword123!';

      const hash = await passwordHandler.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toBeString();
      expect(hash.length).toBeGreaterThan(0);
      // Argon2 hash format: $argon2id$v=19$m=...$t=...$p=...$salt$hash
      expect(hash).toStartWith('$argon2id$');
    });

    it('should generate different hashes for the same password (salt)', async () => {
      const { passwordHandler } = setup();
      const password = 'SamePassword123!';

      const hash1 = await passwordHandler.hash(password);
      const hash2 = await passwordHandler.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should throw DomainError for empty password', async () => {
      const { passwordHandler } = setup();

      await expect(async () => {
        await passwordHandler.hash('');
      }).toThrow(DomainError);
    });

    it('should throw DomainError for null password', async () => {
      const { passwordHandler } = setup();

      await expect(async () => {
        await passwordHandler.hash(null as unknown as string);
      }).toThrow(DomainError);
    });

    it('should work with custom configuration', async () => {
      const mockLogger = {
        setService: mock(() => mockLogger),
        debug: mock(),
        info: mock(),
        warn: mock(),
        error: mock(),
      } as unknown as Logger;

      const passwordHandler = new PasswordHandler({
        logger: mockLogger,
        hashLength: 16,
        timeCost: 2,
        memoryCost: 32768,
        parallelism: 2,
      });

      const password = 'TestPassword123!';
      const hash = await passwordHandler.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toStartWith('$argon2id$');
    });
  });

  describe('verify', () => {
    it('should verify correct password against hash', async () => {
      const { passwordHandler } = setup();
      const password = 'CorrectPassword123!';

      const hash = await passwordHandler.hash(password);
      const isValid = await passwordHandler.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const { passwordHandler } = setup();
      const correctPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword123!';

      const hash = await passwordHandler.hash(correctPassword);
      const isValid = await passwordHandler.verify(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should throw DomainError for empty password', async () => {
      const { passwordHandler } = setup();
      const hash = '$argon2id$v=19$m=65536,t=3,p=4$salt$hash';

      await expect(async () => {
        await passwordHandler.verify('', hash);
      }).toThrow(DomainError);
    });

    it('should throw DomainError for empty hash', async () => {
      const { passwordHandler } = setup();

      await expect(async () => {
        await passwordHandler.verify('password', '');
      }).toThrow(DomainError);
    });

    it('should throw error for invalid hash format', async () => {
      const { passwordHandler } = setup();
      const password = 'TestPassword123!';
      const invalidHash = 'invalid-hash-format';

      await expect(async () => {
        await passwordHandler.verify(password, invalidHash);
      }).toThrow();
    });

    it('should verify password with different hash configurations', async () => {
      const mockLogger = {
        setService: mock(() => mockLogger),
        debug: mock(),
        info: mock(),
        warn: mock(),
        error: mock(),
      } as unknown as Logger;

      const passwordHandler1 = new PasswordHandler({
        logger: mockLogger,
        timeCost: 2,
      });

      const passwordHandler2 = new PasswordHandler({
        logger: mockLogger,
        timeCost: 3,
      });

      const password = 'TestPassword123!';
      const hash1 = await passwordHandler1.hash(password);
      const hash2 = await passwordHandler2.hash(password);

      // Both hashes should verify correctly
      const isValid1 = await passwordHandler1.verify(password, hash1);
      const isValid2 = await passwordHandler2.verify(password, hash2);

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });

  describe('integration', () => {
    it('should hash and verify password in sequence', async () => {
      const { passwordHandler } = setup();
      const password = 'IntegrationTest123!';

      const hash = await passwordHandler.hash(password);
      const isValid = await passwordHandler.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('should handle special characters in password', async () => {
      const { passwordHandler } = setup();
      const password = 'P@ssw0rd!$%^&*()_+-=[]{}|;:,.<>?';

      const hash = await passwordHandler.hash(password);
      const isValid = await passwordHandler.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('should handle unicode characters in password', async () => {
      const { passwordHandler } = setup();
      const password = 'Senha123!🚀中文';

      const hash = await passwordHandler.hash(password);
      const isValid = await passwordHandler.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('should handle very long passwords', async () => {
      const { passwordHandler } = setup();
      const password = 'A'.repeat(1000) + '123!';

      const hash = await passwordHandler.hash(password);
      const isValid = await passwordHandler.verify(password, hash);

      expect(isValid).toBe(true);
    });
  });
});


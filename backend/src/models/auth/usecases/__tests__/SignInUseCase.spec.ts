import { describe, it, expect, mock } from 'bun:test';
import { SignInUseCase } from '../SignInUseCase';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { IOAuth } from '@/common/interfaces/IOAuth';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotSignedError } from '@/common/errors';

describe('SignInUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      log: mock(),
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
    };

    const mockOAuthHandler: IOAuth = {
      signIn: mock(),
      refreshToken: mock(),
      authorize: mock(),
      changePassword: mock(),
      changeTemporaryPassword: mock(),
      signUp: mock(),
    };

    const useCase = new SignInUseCase({
      [AppProviders.logger]: mockLogger,
      [AppProviders.oauthHandler]: mockOAuthHandler,
    });

    return { useCase, mockLogger, mockOAuthHandler };
  };

  describe('execute', () => {
    it('should return tokens on successful sign in', async () => {
      const { useCase, mockOAuthHandler } = setup();

      const mockResult = {
        username: 'testuser',
        status: 'CONFIRMED',
        tokenType: 'Bearer',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
        userEmail: undefined,
      };

      (mockOAuthHandler.signIn as ReturnType<typeof mock>).mockResolvedValue(mockResult);

      const input = {
        username: 'testuser',
        password: 'password123',
      };

      const result = await useCase.execute(input);

      expect(result.accessToken).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.username).toBe('testuser');
      expect(result.status).toBe('CONFIRMED');
      expect(mockOAuthHandler.signIn).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });

    it('should throw NotSignedError when authentication fails', async () => {
      const { useCase, mockOAuthHandler } = setup();

      (mockOAuthHandler.signIn as ReturnType<typeof mock>).mockRejectedValue(
        new NotSignedError({ additionalMessage: 'Invalid credentials' }),
      );

      const input = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      await expect(async () => {
        await useCase.execute(input);
      }).toThrow(NotSignedError);
    });

    it('should include tenantId in output when provided', async () => {
      const { useCase, mockOAuthHandler } = setup();

      const mockResult = {
        username: 'testuser',
        status: 'CONFIRMED',
        tokenType: 'Bearer',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
        userEmail: undefined,
      };

      (mockOAuthHandler.signIn as ReturnType<typeof mock>).mockResolvedValue(mockResult);

      const input = {
        username: 'testuser',
        password: 'password123',
        tenantId: 'tenant-123',
      };

      const result = await useCase.execute(input);

      expect(result.tenantId).toBe('tenant-123');
    });
  });
});


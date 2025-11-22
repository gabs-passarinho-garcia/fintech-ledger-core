import { describe, it, expect, mock } from 'bun:test';
import { RefreshTokenUseCase } from '../RefreshTokenUseCase';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { IOAuth } from '@/common/interfaces/IOAuth';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotSignedError } from '@/common/errors';

describe('RefreshTokenUseCase', () => {
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

    const useCase = new RefreshTokenUseCase({
      [AppProviders.logger]: mockLogger,
      [AppProviders.oauthHandler]: mockOAuthHandler,
    });

    return { useCase, mockLogger, mockOAuthHandler };
  };

  describe('execute', () => {
    it('should return new access token on successful refresh', async () => {
      const { useCase, mockOAuthHandler } = setup();

      const mockResult = {
        username: 'testuser',
        status: 'CONFIRMED',
        tokenType: 'Bearer',
        accessToken: 'new-access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
        userEmail: undefined,
      };

      (mockOAuthHandler.refreshToken as ReturnType<typeof mock>).mockResolvedValue(mockResult);

      const input = {
        username: 'testuser',
        refreshToken: 'refresh-token-123',
      };

      const result = await useCase.execute(input);

      expect(result.accessToken).toBe('new-access-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.username).toBe('testuser');
      expect(mockOAuthHandler.refreshToken).toHaveBeenCalledWith({
        username: 'testuser',
        refreshToken: 'refresh-token-123',
      });
    });

    it('should throw NotSignedError when refresh token is invalid', async () => {
      const { useCase, mockOAuthHandler } = setup();

      (mockOAuthHandler.refreshToken as ReturnType<typeof mock>).mockRejectedValue(
        new NotSignedError({ additionalMessage: 'Invalid refresh token' }),
      );

      const input = {
        username: 'testuser',
        refreshToken: 'invalid-token',
      };

      await expect(async () => {
        await useCase.execute(input);
      }).toThrow(NotSignedError);
    });

    it('should throw NotSignedError when refresh token is expired', async () => {
      const { useCase, mockOAuthHandler } = setup();

      (mockOAuthHandler.refreshToken as ReturnType<typeof mock>).mockRejectedValue(
        new NotSignedError({ additionalMessage: 'Refresh token has expired' }),
      );

      const input = {
        username: 'testuser',
        refreshToken: 'expired-token',
      };

      await expect(async () => {
        await useCase.execute(input);
      }).toThrow(NotSignedError);
    });
  });
});


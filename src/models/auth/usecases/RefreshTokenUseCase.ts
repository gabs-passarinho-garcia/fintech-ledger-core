import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { IOAuth } from '@/common/interfaces/IOAuth';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { RefreshTokenRequest, RefreshTokenResponse } from '../dtos/RefreshToken.dto';

export type RefreshTokenInput = RefreshTokenRequest;

export type RefreshTokenOutput = RefreshTokenResponse;

/**
 * Use case for refreshing an access token using a refresh token.
 * Uses CognitoHandler to refresh tokens.
 */
export class RefreshTokenUseCase implements IService<RefreshTokenInput, RefreshTokenOutput> {
  private readonly logger: ILogger;
  private readonly oauthHandler: IOAuth;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.oauthHandler]: IOAuth;
  }) {
    this.logger = opts[AppProviders.logger];
    this.oauthHandler = opts[AppProviders.oauthHandler];
  }

  /**
   * Executes the refresh token use case.
   *
   * @param input - The input data for refreshing the token
   * @returns The new authentication tokens and user information
   * @throws {NotFoundError} If the user is not found
   * @throws {NotSignedError} If token refresh fails
   */
  public async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    this.logger.info(
      {
        username: input.username,
        hasRefreshToken: !!input.refreshToken,
      },
      'refresh_token:start',
      RefreshTokenUseCase.name,
    );

    const result = await this.oauthHandler.refreshToken({
      refreshToken: input.refreshToken,
      username: input.username,
    });

    this.logger.info(
      {
        username: result.username,
        status: result.status,
        hasAccessToken: !!result.accessToken,
      },
      'refresh_token:success',
      RefreshTokenUseCase.name,
    );

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
      userEmail: result.userEmail,
      username: result.username,
      status: result.status,
    };
  }
}

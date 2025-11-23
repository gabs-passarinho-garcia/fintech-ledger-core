import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { IOAuth } from '@/common/interfaces/IOAuth';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { SignInRequest, SignInResponse } from '../dtos/SignIn.dto';

export type SignInInput = SignInRequest;

export type SignInOutput = SignInResponse;

/**
 * Use case for signing in a user with username and password.
 * Uses CognitoHandler to authenticate and returns tokens.
 */
export class SignInUseCase implements IService<SignInInput, SignInOutput> {
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
   * Executes the sign in use case.
   *
   * @param input - The input data for signing in
   * @returns The authentication tokens and user information
   * @throws {NotFoundError} If the user is not found
   * @throws {NotSignedError} If authentication fails
   */
  public async execute(input: SignInInput): Promise<SignInOutput> {
    this.logger.info(
      {
        username: input.username,
      },
      'sign_in:start',
      SignInUseCase.name,
    );

    const result = await this.oauthHandler.signIn({
      username: input.username,
      password: input.password,
    });

    this.logger.info(
      {
        username: result.username,
        status: result.status,
        hasAccessToken: !!result.accessToken,
      },
      'sign_in:success',
      SignInUseCase.name,
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

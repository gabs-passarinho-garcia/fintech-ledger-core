import { createHmac } from 'crypto';
import {
  CognitoIdentityProvider,
  AuthFlowType,
  UserStatusType,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

import type { IOAuth, IVariable, OAuthSignInOutput } from '@/common/interfaces';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { LOCAL_DEVELOPMENT } from '../../enums';
import { InternalError, NotFoundError, NotSignedError } from '@/common/errors';
import type { Logger } from '@/common/providers/Logger';

const USER_NOT_FOUND_MESSAGE = 'User not found';
const COGNITO_OPERATION_TYPE = 'cognito-operation';
const COGNITO_ERROR_TYPE = 'cognito-error';
const COGNITO_WARNING_TYPE = 'cognito-warning';

/**
 * AWS Cognito handler that implements IOAuth interface.
 * Provides authentication and user management via AWS Cognito.
 * Supports LocalStack for local development.
 */
export class CognitoHandler implements IOAuth {
  private readonly cognitoClient: CognitoIdentityProvider;
  private readonly envVariableHandler: IVariable;
  private readonly secretsHandler: IVariable;
  private readonly logger: Logger;

  /**
   * Creates a new CognitoHandler instance.
   *
   * @param opts - Configuration options
   * @param opts.envVariableHandler - The environment variable handler
   * @param opts.secretsHandler - The secrets handler
   * @param opts.logger - The logger instance
   */
  public constructor(opts: {
    envVariableHandler: IVariable;
    secretsHandler: IVariable;
    [AppProviders.logger]: Logger;
  }) {
    this.envVariableHandler = opts.envVariableHandler;
    this.secretsHandler = opts.secretsHandler;
    this.logger = opts[AppProviders.logger].setService('CognitoHandler');

    // Check if we're in local development mode (LocalStack)
    const isLocalDev = this.envVariableHandler.get<string>(LOCAL_DEVELOPMENT) === 'true';

    this.cognitoClient = new CognitoIdentityProvider({
      apiVersion: this.envVariableHandler.get<string>('AWS_COGNITO_API_VERSION') as string,
      region: this.envVariableHandler.get('AWS_REGION') as string,
      credentials: {
        accessKeyId: this.envVariableHandler.get('AWS_ACCESS_KEY_ID') as string,
        secretAccessKey: this.envVariableHandler.get('AWS_SECRET_ACCESS_KEY') as string,
      },
      ...(isLocalDev && {
        endpoint: 'http://localstack:4566',
      }),
    });
  }

  /**
   * Changes a temporary password to a permanent one.
   *
   * @param args - Change password arguments
   * @param args.username - User's username
   * @param args.temporaryPassword - The temporary password
   * @param args.newPassword - The new permanent password
   * @returns A promise that resolves to success status
   */
  public async changeTemporaryPassword(args: {
    username: string;
    temporaryPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> {
    try {
      const { username, temporaryPassword, newPassword } = args;

      const secretHash = await this.getSecretHash(username);

      const cognitoUser = await this.cognitoClient.initiateAuth({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: await this.secretsHandler.get('AWS_COGNITO_CLIENT_ID'),
        AuthParameters: {
          USERNAME: username,
          PASSWORD: temporaryPassword,
          SECRET_HASH: secretHash,
        },
      });

      if (!cognitoUser) {
        throw new NotFoundError({
          message: USER_NOT_FOUND_MESSAGE,
        });
      }

      const cognitoCurrentUser = await this.cognitoClient.adminGetUser({
        Username: username,
        UserPoolId: await this.secretsHandler.get('AWS_COGNITO_USER_POOL_ID'),
      });

      if (cognitoCurrentUser?.UserStatus !== UserStatusType.FORCE_CHANGE_PASSWORD) {
        throw new InternalError({
          additionalMessage: 'User is not required to change password',
        });
      }

      await this.cognitoClient.adminSetUserPassword({
        UserPoolId: await this.secretsHandler.get('AWS_COGNITO_USER_POOL_ID'),
        Username: username,
        Password: newPassword,
        Permanent: true,
      });

      this.logger.info(
        { username, operation: 'changeTemporaryPassword', success: true },
        COGNITO_OPERATION_TYPE,
        'CognitoHandler',
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        {
          username: args.username,
          operation: 'changeTemporaryPassword',
          error: error instanceof Error ? error.message : String(error),
        },
        COGNITO_ERROR_TYPE,
        'CognitoHandler',
      );

      throw new InternalError({
        additionalMessage: `Error changing temporary password: ${error}`,
        originalError: error,
      });
    }
  }

  /**
   * Signs in a user with username and password.
   *
   * @param args - Sign-in arguments
   * @param args.username - User's username
   * @param args.password - User's password
   * @returns A promise that resolves to OAuth sign-in output
   */
  public async signIn(args: { username: string; password: string }): Promise<OAuthSignInOutput> {
    const { username, password } = args;

    this.logger.debug({ username, operation: 'signIn' }, COGNITO_OPERATION_TYPE, 'CognitoHandler');

    const secretHash = await this.getSecretHash(username);

    const initiateAuthResponse = await this.cognitoClient.initiateAuth({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: await this.secretsHandler.get('AWS_COGNITO_CLIENT_ID'),
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const cognitoCurrentUser = await this.cognitoClient.adminGetUser({
      Username: username,
      UserPoolId: await this.secretsHandler.get('AWS_COGNITO_USER_POOL_ID'),
    });

    const userEmail = cognitoCurrentUser.UserAttributes?.find(
      (attribute: { Name?: string; Value?: string }) => attribute.Name === 'email',
    );

    if (!cognitoCurrentUser || !cognitoCurrentUser.UserStatus) {
      this.logger.warn(
        { username, operation: 'signIn', reason: USER_NOT_FOUND_MESSAGE },
        COGNITO_WARNING_TYPE,
        'CognitoHandler',
      );

      throw new NotFoundError({
        message: USER_NOT_FOUND_MESSAGE,
      });
    }

    this.logger.info(
      {
        username,
        operation: 'signIn',
        status: cognitoCurrentUser.UserStatus,
        hasAccessToken: !!initiateAuthResponse?.AuthenticationResult?.AccessToken,
      },
      COGNITO_OPERATION_TYPE,
      'CognitoHandler',
    );

    return {
      username,
      status: cognitoCurrentUser.UserStatus,
      tokenType: initiateAuthResponse?.AuthenticationResult?.TokenType,
      accessToken: initiateAuthResponse?.AuthenticationResult?.AccessToken,
      refreshToken: initiateAuthResponse?.AuthenticationResult?.RefreshToken,
      expiresIn: initiateAuthResponse?.AuthenticationResult?.ExpiresIn,
      userEmail: userEmail?.Value,
    };
  }

  /**
   * Refreshes an access token using a refresh token.
   *
   * @param args - Refresh token arguments
   * @param args.refreshToken - The refresh token
   * @param args.username - User's username
   * @returns A promise that resolves to OAuth sign-in output
   */
  public async refreshToken(args: {
    refreshToken: string;
    username: string;
  }): Promise<OAuthSignInOutput> {
    try {
      const { refreshToken, username } = args;

      this.logger.debug(
        { username, operation: 'refreshToken' },
        COGNITO_OPERATION_TYPE,
        'CognitoHandler',
      );

      const secretHash = await this.getSecretHash(username);

      const initiateAuthResponse = await this.cognitoClient.initiateAuth({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: await this.secretsHandler.get('AWS_COGNITO_CLIENT_ID'),
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH: secretHash,
        },
      });

      const cognitoCurrentUser = await this.cognitoClient.adminGetUser({
        Username: username,
        UserPoolId: await this.secretsHandler.get('AWS_COGNITO_USER_POOL_ID'),
      });

      const userEmail = cognitoCurrentUser.UserAttributes?.find(
        (attribute: { Name?: string; Value?: string }) => attribute.Name === 'email',
      );

      if (!cognitoCurrentUser || !cognitoCurrentUser.UserStatus) {
        this.logger.warn(
          { username, operation: 'refreshToken', reason: USER_NOT_FOUND_MESSAGE },
          COGNITO_WARNING_TYPE,
          'CognitoHandler',
        );

        throw new NotFoundError({
          message: USER_NOT_FOUND_MESSAGE,
        });
      }

      this.logger.info(
        {
          username,
          operation: 'refreshToken',
          status: cognitoCurrentUser.UserStatus,
          hasAccessToken: !!initiateAuthResponse?.AuthenticationResult?.AccessToken,
        },
        COGNITO_OPERATION_TYPE,
        'CognitoHandler',
      );

      return {
        username,
        status: cognitoCurrentUser.UserStatus,
        tokenType: initiateAuthResponse?.AuthenticationResult?.TokenType,
        accessToken: initiateAuthResponse?.AuthenticationResult?.AccessToken,
        refreshToken: initiateAuthResponse?.AuthenticationResult?.RefreshToken || refreshToken,
        expiresIn: initiateAuthResponse?.AuthenticationResult?.ExpiresIn,
        userEmail: userEmail?.Value,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.error(
        {
          username: args.username,
          operation: 'refreshToken',
          error: error instanceof Error ? error.message : String(error),
        },
        COGNITO_ERROR_TYPE,
        'CognitoHandler',
      );

      throw new NotSignedError({
        additionalMessage: `Error refreshing token`,
        originalError: error,
      });
    }
  }

  /**
   * Generates a secret hash for Cognito authentication.
   *
   * @param username - The username
   * @returns A promise that resolves to the secret hash
   */
  private async getSecretHash(username: string): Promise<string> {
    const hasher = createHmac('sha256', await this.secretsHandler.get('AWS_COGNITO_CLIENT_SECRET'));
    hasher.update(`${username}${await this.secretsHandler.get('AWS_COGNITO_CLIENT_ID')}`);

    return hasher.digest('base64');
  }

  /**
   * Changes a user's password.
   *
   * @param args - Change password arguments
   * @param args.username - User's username
   * @param args.newPassword - The new password
   * @returns A promise that resolves to success status
   */
  public async changePassword(args: { username: string; newPassword: string }): Promise<{
    success: boolean;
  }> {
    this.logger.debug(
      { username: args.username, operation: 'changePassword' },
      COGNITO_OPERATION_TYPE,
      'CognitoHandler',
    );

    await this.cognitoClient.adminSetUserPassword({
      Username: args.username,
      UserPoolId: await this.secretsHandler.get('AWS_COGNITO_USER_POOL_ID'),
      Password: args.newPassword,
      Permanent: true,
    });

    this.logger.info(
      { username: args.username, operation: 'changePassword', success: true },
      COGNITO_OPERATION_TYPE,
      'CognitoHandler',
    );

    return { success: true };
  }

  /**
   * Signs up a new user.
   *
   * @param args - Sign-up arguments
   * @param args.username - User's username
   * @param args.useremail - User's email
   * @param args.password - User's password
   * @returns A promise that resolves when sign-up is complete
   */
  public async signUp(args: {
    username: string;
    useremail: string;
    password: string;
  }): Promise<void> {
    this.logger.debug(
      { username: args.username, useremail: args.useremail, operation: 'signUp' },
      COGNITO_OPERATION_TYPE,
      'CognitoHandler',
    );

    await this.cognitoClient.adminCreateUser({
      Username: args.username,
      UserPoolId: await this.secretsHandler.get('AWS_COGNITO_USER_POOL_ID'),
      DesiredDeliveryMediums: ['EMAIL'],
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        {
          Name: 'email',
          Value: args.useremail,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
    });

    await this.cognitoClient.adminSetUserPassword({
      Username: args.username,
      UserPoolId: await this.secretsHandler.get('AWS_COGNITO_USER_POOL_ID'),
      Password: args.password,
      Permanent: true,
    });

    this.logger.info(
      { username: args.username, useremail: args.useremail, operation: 'signUp', success: true },
      COGNITO_OPERATION_TYPE,
      'CognitoHandler',
    );
  }

  /**
   * Authorizes a token and returns the username.
   *
   * @param args - Authorization arguments
   * @param args.token - The access token to authorize
   * @returns A promise that resolves to user information
   */
  public async authorize(args: { token: string }): Promise<{ username: string }> {
    try {
      this.logger.debug({ operation: 'authorize' }, COGNITO_OPERATION_TYPE, 'CognitoHandler');

      const verifier = CognitoJwtVerifier.create({
        userPoolId: await this.secretsHandler.get('AWS_COGNITO_USER_POOL_ID'),
        clientId: await this.secretsHandler.get('AWS_COGNITO_CLIENT_ID'),
        tokenUse: 'access',
      });

      const payload = await verifier.verify(args.token, {
        tokenUse: 'access',
        clientId: await this.secretsHandler.get('AWS_COGNITO_CLIENT_ID'),
        graceSeconds: 1,
      });

      if (!payload || !payload?.username) {
        this.logger.warn(
          { operation: 'authorize', reason: 'Invalid or not found user by provided access token' },
          COGNITO_WARNING_TYPE,
          'CognitoHandler',
        );

        throw new NotSignedError({
          additionalMessage: 'Invalid or not found user by provided access token',
        });
      }

      this.logger.info(
        { username: payload.username, operation: 'authorize', success: true },
        COGNITO_OPERATION_TYPE,
        'CognitoHandler',
      );

      return { username: payload.username };
    } catch (error) {
      this.logger.error(
        {
          operation: 'authorize',
          error: error instanceof Error ? error.message : String(error),
        },
        COGNITO_ERROR_TYPE,
        'CognitoHandler',
      );

      throw new NotSignedError({
        additionalMessage: `Error on authorize: ${error}`,
      });
    }
  }
}

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { fromEnv } from '@aws-sdk/credential-providers';

import { InternalError, NotFoundError } from '../../errors';
import { AppEnvironment, LOCAL_DEVELOPMENT } from '../../enums';
import type { IVariable } from '@/common/interfaces';

/**
 * AWS Secrets Manager handler that implements IVariable interface.
 * Provides secure access to secrets with fallback to environment variables.
 * Supports LocalStack for local development.
 */
export class SecretsHandler implements IVariable {
  private readonly secretsClient: SecretsManagerClient;
  private readonly envVariableHandler: IVariable;

  /**
   * Creates a new SecretsHandler instance.
   *
   * @param opts - Configuration options
   * @param opts.envVariableHandler - The environment variable handler
   */
  public constructor(opts: { envVariableHandler: IVariable }) {
    this.envVariableHandler = opts.envVariableHandler;

    // Check if we're in local development mode (LocalStack)
    const isLocalDev = this.envVariableHandler.get<string>(LOCAL_DEVELOPMENT) === 'true';

    this.secretsClient = new SecretsManagerClient({
      region: this.envVariableHandler.get<string>('AWS_REGION') as string,
      credentials: fromEnv(),
      ...(isLocalDev && {
        endpoint: 'http://localhost:4566',
        forcePathStyle: true,
      }),
    });
  }

  /**
   * Gets a secret value by key.
   * First tries to get from environment variables, then from AWS Secrets Manager.
   *
   * @template T The type of the value to retrieve
   * @param key - The secret key to retrieve
   * @returns A promise that resolves to the secret value
   * @throws {InternalError} If secret cannot be retrieved
   */
  public async get<T>(key: string): Promise<T> {
    try {
      // First, try to get from environment variables
      try {
        return await this.envVariableHandler.get(key);
      } catch {
        // Continue to secrets manager if env variable not found
      }

      // If not found in env, try to get from Secrets Manager
      const env = await this.envVariableHandler.get<string>('APP_ENV');
      const trueEnv = env === AppEnvironment.LOCAL ? AppEnvironment.DEVELOPMENT : env;
      const secretName = `fintech_ledger_core_${trueEnv}/env`;

      console.info(`Fetching secret: ${secretName}`);
      const response = await this.secretsClient.send(
        new GetSecretValueCommand({
          SecretId: secretName,
          VersionStage: 'AWSCURRENT',
        }),
      );

      if (!response.SecretString) {
        throw new NotFoundError({
          message: `Secret, ${key}, not found`,
        });
      }

      const result = JSON.parse(response.SecretString)[key];

      if (result === undefined) {
        throw new NotFoundError({
          message: `Secret key, ${key}, not found in secret store`,
        });
      }

      await this.envVariableHandler.set(key, result);

      return result as T;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalError({
        additionalMessage: `Error fetching secret, ${key}, error: ${error}`,
        originalError: error,
      });
    }
  }

  /**
   * Sets a value using the environment variable handler.
   *
   * @template T The type of the value to set
   * @param key - The secret key
   * @param value - The secret value
   */
  public async set<T>(key: string, value: T): Promise<void> {
    await this.envVariableHandler.set(key, value);
  }
}

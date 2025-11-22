import { InternalError } from '@/common/errors';
import type { IVariable } from '@/common/interfaces';

/**
 * Environment variable handler that implements IVariable interface.
 * Reads and writes environment variables from process.env/Bun.env.
 */
export class EnvVariableHandler implements IVariable {
  /**
   * Gets an environment variable by key.
   *
   * @template T The type of the value to retrieve
   * @param key - The environment variable key
   * @returns The environment variable value
   * @throws {InternalError} If the environment variable is not defined
   */
  public get<T = string>(key: string): T {
    const value = Bun.env[key];
    if (value === undefined) {
      throw new InternalError({
        additionalMessage: `Environment variable ${key} is not defined`,
      });
    }
    return value as T;
  }

  /**
   * Sets an environment variable by key.
   *
   * @template T The type of the value to set
   * @param key - The environment variable key
   * @param value - The value to set
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async set<T = string>(key: string, value: T): Promise<void> {
    Bun.env[key] = value as unknown as string;
  }
}

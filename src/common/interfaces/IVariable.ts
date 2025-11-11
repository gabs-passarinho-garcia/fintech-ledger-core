/**
 * Interface for variable and secret management.
 * Defines the contract for classes that handle environment variables and secrets.
 */
export interface IVariable {
  /**
   * Gets a value by key.
   * First tries to get from environment variables, then from secrets manager.
   *
   * @template T The type of the value to retrieve
   * @param key - The key to retrieve
   * @returns The value or a promise that resolves to the value
   */
  get<T>(key: string): T | Promise<T>;

  /**
   * Sets a value by key.
   *
   * @template T The type of the value to set
   * @param key - The key to set
   * @param value - The value to set
   * @returns A promise that resolves when the value is set, or void for synchronous operations
   */
  set<T>(key: string, value: T): Promise<void> | void;
}

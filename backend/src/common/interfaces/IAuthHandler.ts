/**
 * Interface for authentication handlers.
 * Defines the contract for classes that handle authentication logic.
 */
export interface IAuthHandler {
  /**
   * Authenticates a request based on headers.
   *
   * @param args - Authentication arguments
   * @param args.headers - Request headers containing authentication information
   * @returns A promise that resolves when authentication is successful
   * @throws {NotSignedError} If authentication fails
   */
  auth(args: { headers: Record<string, unknown> }): Promise<void>;
}

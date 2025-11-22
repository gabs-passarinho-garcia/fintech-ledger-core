/**
 * OAuth sign-in output type.
 */
export type OAuthSignInOutput = {
  username: string;
  status: string;
  tokenType?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  userEmail?: string;
};

/**
 * Interface for OAuth providers.
 * Defines the contract for classes that handle OAuth authentication.
 */
export interface IOAuth {
  /**
   * Signs in a user with username and password.
   *
   * @param args - Sign-in arguments
   * @param args.username - User's username
   * @param args.password - User's password
   * @returns A promise that resolves to OAuth sign-in output
   */
  signIn(args: { username: string; password: string }): Promise<OAuthSignInOutput>;

  /**
   * Refreshes an access token using a refresh token.
   *
   * @param args - Refresh token arguments
   * @param args.refreshToken - The refresh token
   * @param args.username - User's username
   * @returns A promise that resolves to OAuth sign-in output
   */
  refreshToken(args: { refreshToken: string; username: string }): Promise<OAuthSignInOutput>;

  /**
   * Changes a temporary password to a permanent one.
   *
   * @param args - Change password arguments
   * @param args.username - User's username
   * @param args.temporaryPassword - The temporary password
   * @param args.newPassword - The new permanent password
   * @returns A promise that resolves to success status
   */
  changeTemporaryPassword(args: {
    username: string;
    temporaryPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }>;

  /**
   * Changes a user's password.
   *
   * @param args - Change password arguments
   * @param args.username - User's username
   * @param args.newPassword - The new password
   * @returns A promise that resolves to success status
   */
  changePassword(args: { username: string; newPassword: string }): Promise<{
    success: boolean;
  }>;

  /**
   * Signs up a new user.
   *
   * @param args - Sign-up arguments
   * @param args.username - User's username
   * @param args.useremail - User's email
   * @param args.password - User's password
   * @returns A promise that resolves when sign-up is complete
   */
  signUp(args: { username: string; useremail: string; password: string }): Promise<void>;

  /**
   * Authorizes a token and returns the username.
   *
   * @param args - Authorization arguments
   * @param args.token - The access token to authorize
   * @returns A promise that resolves to user information
   */
  authorize(args: { token: string }): Promise<{ username: string }>;
}

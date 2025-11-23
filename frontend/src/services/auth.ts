import { endpoints } from "../api/endpoints";
import { storage } from "../utils/storage";
import { extractUserFromToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import type { SignInResponse, SignUpResponse, User } from "../types";

/**
 * Authentication service
 * Handles sign in, sign up, token refresh, and session management
 */

const INVALID_RESPONSE_MESSAGE = "Invalid response from server";
const AUTH_SERVICE_NAME = "AuthService";
const UNKNOWN_ERROR_MESSAGE = "Unknown error";

export interface SignInInput {
  username: string;
  password: string;
}

export interface SignUpInput {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
}

/**
 * Signs in a user with username and password
 */
export async function signIn(input: SignInInput): Promise<SignInResponse> {
  logger.info({ username: input.username }, "sign_in:start", AUTH_SERVICE_NAME);

  try {
    const response = await endpoints.auth.signIn(input);

    if (!response.data?.data) {
      logger.error(
        { error: INVALID_RESPONSE_MESSAGE },
        "sign_in:invalid_response",
        AUTH_SERVICE_NAME,
      );
      throw new Error(INVALID_RESPONSE_MESSAGE);
    }

    const data = response.data.data;

    // Store tokens
    if (data.accessToken) {
      storage.setAccessToken(data.accessToken);
    }
    if (data.refreshToken) {
      storage.setRefreshToken(data.refreshToken);
    }

    // Extract user info from token
    const tokenUser = data.accessToken
      ? extractUserFromToken(data.accessToken)
      : null;

    // Store user data (without tenantId - will be set when profile is selected)
    storage.setUserData({
      username: data.username,
      email: data.userEmail,
      isMaster: tokenUser?.isMaster ?? false,
    });

    logger.info(
      { username: data.username },
      "sign_in:success",
      AUTH_SERVICE_NAME,
    );

    return data;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE },
      "sign_in:error",
      AUTH_SERVICE_NAME,
    );
    throw error;
  }
}

/**
 * Signs up a new user
 */
export async function signUp(input: SignUpInput): Promise<SignUpResponse> {
  logger.info(
    { username: input.username, email: input.email },
    "sign_up:start",
    AUTH_SERVICE_NAME,
  );

  try {
    const response = await endpoints.auth.signUp(input);

    if (
      !response ||
      typeof response !== "object" ||
      !("data" in response) ||
      !response.data ||
      typeof response.data !== "object" ||
      !("data" in response.data) ||
      !response.data.data
    ) {
      logger.error(
        { error: INVALID_RESPONSE_MESSAGE },
        "sign_up:invalid_response",
        AUTH_SERVICE_NAME,
      );
      throw new Error(INVALID_RESPONSE_MESSAGE);
    }

    logger.info(
      { username: input.username },
      "sign_up:success",
      AUTH_SERVICE_NAME,
    );

    return response.data.data as SignUpResponse;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE },
      "sign_up:error",
      AUTH_SERVICE_NAME,
    );
    throw error;
  }
}

/**
 * Refreshes the access token using the refresh token
 */
export async function refreshToken(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  logger.debug({}, "refresh_token:start", AUTH_SERVICE_NAME);

  const refreshTokenValue = storage.getRefreshToken();
  if (!refreshTokenValue) {
    logger.warn({}, "refresh_token:no_token", AUTH_SERVICE_NAME);
    throw new Error("No refresh token available");
  }

  try {
    const response = await endpoints.auth.refreshToken(refreshTokenValue);

    if (
      !response ||
      typeof response !== "object" ||
      !("data" in response) ||
      !response.data ||
      typeof response.data !== "object" ||
      !("data" in response.data) ||
      !response.data.data
    ) {
      logger.error(
        { error: INVALID_RESPONSE_MESSAGE },
        "refresh_token:invalid_response",
        AUTH_SERVICE_NAME,
      );
      throw new Error(INVALID_RESPONSE_MESSAGE);
    }

    const data = response.data.data;

    if (data.accessToken && data.refreshToken) {
      storage.setAccessToken(data.accessToken);
      storage.setRefreshToken(data.refreshToken);

      // Update user data with isMaster from new token
      const tokenUser = extractUserFromToken(data.accessToken);
      const currentUserData = storage.getUserData<{
        username?: string;
        email?: string;
        tenantId?: string;
        isMaster?: boolean;
      }>();

      if (currentUserData) {
        storage.setUserData({
          ...currentUserData,
          isMaster: tokenUser?.isMaster ?? currentUserData.isMaster ?? false,
        });
      }

      logger.debug({}, "refresh_token:success", AUTH_SERVICE_NAME);
    }

    return {
      accessToken: data.accessToken || "",
      refreshToken: data.refreshToken || "",
    };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE },
      "refresh_token:error",
      AUTH_SERVICE_NAME,
    );
    throw error;
  }
}

/**
 * Signs out the current user
 */
export function signOut(): void {
  logger.info({}, "sign_out:start", AUTH_SERVICE_NAME);
  storage.clear();
  logger.info({}, "sign_out:success", AUTH_SERVICE_NAME);
}

/**
 * Gets the current authenticated user
 * Returns a partial User object if full user data is not available
 */
export function getCurrentUser(): User | null {
  const userData = storage.getUserData<{
    id?: string;
    username?: string;
    email?: string;
    tenantId?: string;
    createdAt?: Date | string;
    isMaster?: boolean;
  }>();

  if (!userData || !userData.username) {
    // Try to extract from token if available
    const token = storage.getAccessToken();
    if (token) {
      const tokenUser = extractUserFromToken(token);
      if (tokenUser?.username) {
        return {
          id: tokenUser.userId || "",
          username: tokenUser.username,
          createdAt: new Date().toISOString(),
          isMaster: tokenUser.isMaster ?? false,
        };
      }
    }
    return null;
  }

  // Return a User object, using defaults for missing fields
  return {
    id: userData.id || "",
    username: userData.username,
    createdAt: userData.createdAt || new Date().toISOString(),
    isMaster: userData.isMaster ?? false,
  };
}

/**
 * Checks if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!storage.getAccessToken();
}

/**
 * Gets the current access token
 */
export function getAccessToken(): string | null {
  return storage.getAccessToken();
}

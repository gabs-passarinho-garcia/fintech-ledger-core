import { endpoints } from "../api/endpoints";
import { storage } from "../utils/storage";
import type { SignInResponse, SignUpResponse, User } from "../types";

/**
 * Authentication service
 * Handles sign in, sign up, token refresh, and session management
 */

const INVALID_RESPONSE_MESSAGE = "Invalid response from server";

export interface SignInInput {
  username: string;
  password: string;
  tenantId?: string;
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
  const response = await endpoints.auth.signIn(input);

  if (!response.data?.data) {
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
  if (data.tenantId) {
    storage.setTenantId(data.tenantId);
  }

  // Store user data
  storage.setUserData({
    username: data.username,
    email: data.userEmail,
    tenantId: data.tenantId,
  });

  return data;
}

/**
 * Signs up a new user
 */
export async function signUp(input: SignUpInput): Promise<SignUpResponse> {
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
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return response.data.data as SignUpResponse;
}

/**
 * Refreshes the access token using the refresh token
 */
export async function refreshToken(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const refreshTokenValue = storage.getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

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
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const data = response.data.data;

  if (data.accessToken && data.refreshToken) {
    storage.setAccessToken(data.accessToken);
    storage.setRefreshToken(data.refreshToken);
  }

  return {
    accessToken: data.accessToken || "",
    refreshToken: data.refreshToken || "",
  };
}

/**
 * Signs out the current user
 */
export function signOut(): void {
  storage.clear();
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
  }>();

  if (!userData || !userData.username) {
    return null;
  }

  // Return a User object, using defaults for missing fields
  return {
    id: userData.id || "",
    username: userData.username,
    createdAt: userData.createdAt || new Date().toISOString(),
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

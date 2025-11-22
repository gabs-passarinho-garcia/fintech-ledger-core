import { endpoints } from '../api/endpoints';
import { storage } from '../utils/storage';
import type { SignInResponse, SignUpResponse, User } from '../types';

/**
 * Authentication service
 * Handles sign in, sign up, token refresh, and session management
 */

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
    throw new Error('Invalid response from server');
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

  if (!response.data?.data) {
    throw new Error('Invalid response from server');
  }

  return response.data.data;
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
    throw new Error('No refresh token available');
  }

  const response = await endpoints.auth.refreshToken(refreshTokenValue);

  if (!response.data?.data) {
    throw new Error('Invalid response from server');
  }

  const data = response.data.data;

  if (data.accessToken && data.refreshToken) {
    storage.setAccessToken(data.accessToken);
    storage.setRefreshToken(data.refreshToken);
  }

  return {
    accessToken: data.accessToken || '',
    refreshToken: data.refreshToken || '',
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
 */
export function getCurrentUser(): User | null {
  return storage.getUserData<User>();
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


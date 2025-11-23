import { endpoints } from "../api/endpoints";

/**
 * Account service
 * Handles account operations
 */

export interface AccountResponse {
  id: string;
  tenantId: string;
  profileId: string | null;
  name: string;
  balance: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gets accounts for the current user's profile
 */
export async function getMyAccounts(): Promise<{
  accounts: AccountResponse[];
}> {
  const response = await endpoints.accounts.getMyAccounts();

  if (!response.data?.data) {
    throw new Error("Failed to get accounts");
  }

  return response.data.data;
}

/**
 * Lists accounts by profile ID (master users only)
 */
export async function listAccountsByProfile(
  profileId: string,
): Promise<{ accounts: AccountResponse[] }> {
  const response = await endpoints.accounts.listAccountsByProfile(profileId);

  if (!response.data?.data) {
    throw new Error("Failed to list accounts by profile");
  }

  return response.data.data;
}

/**
 * Lists all profiles with their accounts (master users only)
 */
export async function listProfilesWithAccounts(): Promise<{
  profiles: Array<{
    id: string;
    userId: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    email: string;
    balance: string;
    createdAt: Date;
    updatedAt: Date;
    accounts: Array<{
      id: string;
      name: string;
      balance: string;
    }>;
  }>;
}> {
  const response = await endpoints.accounts.listProfilesWithAccounts();

  if (!response.data?.data) {
    throw new Error("Failed to list profiles with accounts");
  }

  return response.data.data;
}

/**
 * Creates a new account
 */
export interface CreateAccountInput {
  tenantId: string;
  profileId: string;
  name: string;
  initialBalance?: number | string;
}

export async function createAccount(
  data: CreateAccountInput,
): Promise<AccountResponse> {
  const response = await endpoints.accounts.createAccount(data);

  if (!response.data?.data) {
    throw new Error("Failed to create account");
  }

  return response.data.data;
}

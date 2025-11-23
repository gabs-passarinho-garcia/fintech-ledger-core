import { endpoints } from "../api/endpoints";
import type { Profile } from "../types";

/**
 * Profile service
 * Handles profile operations
 */

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Gets a profile by ID
 */
export async function getProfile(profileId: string): Promise<Profile> {
  const response = await endpoints.users.getProfile(profileId);

  if (!response.data?.data) {
    throw new Error("Profile not found");
  }

  return response.data.data;
}

/**
 * Gets the current user's profile
 */
export async function getMyProfile(): Promise<Profile> {
  const response = await endpoints.users.getMyProfile();

  if (!response.data?.data) {
    throw new Error("Profile not found");
  }

  return response.data.data;
}

/**
 * Updates a profile
 */
export async function updateProfile(
  profileId: string,
  data: UpdateProfileInput,
): Promise<Profile> {
  const response = await endpoints.users.updateProfile(profileId, data);

  if (!response.data?.data) {
    throw new Error("Failed to update profile");
  }

  return response.data.data;
}

/**
 * Lists profiles
 */
export async function listProfiles(query?: {
  page?: number;
  limit?: number;
}): Promise<{ profiles: Profile[] }> {
  const response = await endpoints.users.listProfiles(query);

  if (!response.data?.data) {
    throw new Error("Failed to list profiles");
  }

  return response.data.data;
}

/**
 * Lists profiles by tenant
 */
export async function listProfilesByTenant(
  tenantId: string,
): Promise<{ profiles: Profile[] }> {
  const response = await endpoints.users.listProfilesByTenant(tenantId);

  if (!response.data?.data) {
    throw new Error("Failed to list profiles by tenant");
  }

  return response.data.data;
}

/**
 * Creates a new profile
 */
export async function createProfile(data: {
  firstName: string;
  lastName: string;
  email: string;
  tenantId: string;
}): Promise<Profile> {
  const response = await endpoints.users.createProfile(data);

  if (!response.data?.data) {
    throw new Error("Failed to create profile");
  }

  return response.data.data;
}

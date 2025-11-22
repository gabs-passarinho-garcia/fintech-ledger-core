import { endpoints } from '../api/endpoints';
import type { Profile } from '../types';

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
    throw new Error('Profile not found');
  }

  return response.data.data;
}

/**
 * Gets the current user's profile
 */
export async function getMyProfile(): Promise<Profile> {
  const response = await endpoints.users.getMyProfile();

  if (!response.data?.data) {
    throw new Error('Profile not found');
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
    throw new Error('Failed to update profile');
  }

  return response.data.data;
}

/**
 * Lists profiles
 */
export async function listProfiles(query?: {
  page?: number;
  limit?: number;
}): Promise<{ profiles: Profile[]; pagination: unknown }> {
  const response = await endpoints.users.listProfiles(query);

  if (!response.data?.data) {
    throw new Error('Failed to list profiles');
  }

  return response.data.data;
}


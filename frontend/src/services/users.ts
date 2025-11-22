import { endpoints } from '../api/endpoints';
import type { User, Profile } from '../types';

/**
 * Users service
 * Handles user management operations (master/admin)
 */

/**
 * Lists all users
 */
export async function listAllUsers(query?: {
  page?: number;
  limit?: number;
}): Promise<{ users: User[]; pagination: unknown }> {
  const response = await endpoints.users.listAllUsers(query);

  if (!response.data?.data) {
    throw new Error('Failed to list users');
  }

  return response.data.data;
}

/**
 * Lists all profiles
 */
export async function listAllProfiles(query?: {
  page?: number;
  limit?: number;
}): Promise<{ profiles: Profile[]; pagination: unknown }> {
  const response = await endpoints.users.listAllProfiles(query);

  if (!response.data?.data) {
    throw new Error('Failed to list profiles');
  }

  return response.data.data;
}

/**
 * Deletes a user
 */
export async function deleteUser(userId: string): Promise<void> {
  const response = await endpoints.users.deleteUser(userId);

  if (response.error) {
    throw new Error('Failed to delete user');
  }
}

/**
 * Deletes a profile
 */
export async function deleteProfile(profileId: string): Promise<void> {
  const response = await endpoints.users.deleteProfile(profileId);

  if (response.error) {
    throw new Error('Failed to delete profile');
  }
}


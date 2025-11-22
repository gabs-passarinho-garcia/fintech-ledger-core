import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  signIn,
  signUp,
  signOut,
  isAuthenticated,
  getCurrentUser,
} from "../auth";
import { storage } from "../../utils/storage";
import * as endpointsModule from "../../api/endpoints";

// Mock endpoints
const mockSignIn = mock();
const mockSignUp = mock();
const mockRefreshToken = mock();

mock.module("../../api/endpoints", () => ({
  endpoints: {
    auth: {
      signIn: mockSignIn,
      signUp: mockSignUp,
      refreshToken: mockRefreshToken,
    },
  },
}));

describe("auth service", () => {
  beforeEach(() => {
    storage.clear();
    mock.restore();
  });

  it("should sign in successfully", async () => {
    const mockResponse = {
      data: {
        data: {
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          username: "testuser",
          status: "active",
        },
      },
    };

    mockSignIn.mockResolvedValue(mockResponse);

    const result = await signIn({
      username: "testuser",
      password: "password",
    });

    expect(result.accessToken).toBe("test-access-token");
    expect(storage.getAccessToken()).toBe("test-access-token");
    expect(storage.getRefreshToken()).toBe("test-refresh-token");
  });

  it("should sign up successfully", async () => {
    const mockResponse = {
      data: {
        data: {
          user: {
            id: "user-1",
            username: "testuser",
            createdAt: new Date(),
          },
        },
      },
    };

    mockSignUp.mockResolvedValue(mockResponse);

    const result = await signUp({
      username: "testuser",
      password: "password",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    });

    expect(result.user.username).toBe("testuser");
  });

  it("should sign out and clear storage", () => {
    storage.setAccessToken("test-token");
    storage.setRefreshToken("test-refresh");
    expect(isAuthenticated()).toBe(true);

    signOut();

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("should check authentication status", () => {
    expect(isAuthenticated()).toBe(false);
    storage.setAccessToken("test-token");
    expect(isAuthenticated()).toBe(true);
  });

  it("should get current user", () => {
    const userData = { username: "testuser", email: "test@example.com" };
    storage.setUserData(userData);
    const user = getCurrentUser();
    expect(user).toEqual(userData);
  });
});

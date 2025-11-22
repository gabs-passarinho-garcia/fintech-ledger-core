import { describe, it, expect, beforeEach, mock } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { storage } from "../../utils/storage";

// Mock auth service
const mockSignIn = mock();
const mockSignUp = mock();
const mockSignOut = mock();
const mockGetCurrentUser = mock();
const mockIsAuthenticated = mock();

mock.module("../../services/auth", () => ({
  signIn: mockSignIn,
  signUp: mockSignUp,
  signOut: mockSignOut,
  getCurrentUser: mockGetCurrentUser,
  isAuthenticated: mockIsAuthenticated,
}));

describe("useAuth hook", () => {
  beforeEach(() => {
    storage.clear();
    mock.restore();
    mockIsAuthenticated.mockReturnValue(false);
    mockGetCurrentUser.mockReturnValue(null);
  });

  it("should initialize with null user when not authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(false);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isMaster).toBe(false);
  });

  it("should initialize with user when authenticated", async () => {
    const mockUser = {
      id: "user-123",
      username: "testuser",
      createdAt: new Date(),
      isMaster: true,
    };

    mockIsAuthenticated.mockReturnValue(true);
    mockGetCurrentUser.mockReturnValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isMaster).toBe(true);
  });

  it("should sign in successfully", async () => {
    const mockResponse = {
      accessToken: "token",
      refreshToken: "refresh",
      username: "testuser",
      status: "active",
    };

    const mockUser = {
      id: "user-123",
      username: "testuser",
      createdAt: new Date(),
      isMaster: false,
    };

    mockSignIn.mockResolvedValue(mockResponse);
    mockGetCurrentUser.mockReturnValue(mockUser);
    mockIsAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth());

    await result.current.signIn({
      username: "testuser",
      password: "password",
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      username: "testuser",
      password: "password",
    });
    expect(result.current.user).toEqual(mockUser);
  });

  it("should sign out successfully", () => {
    const { result } = renderHook(() => useAuth());

    result.current.signOut();

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it("should return isMaster from user", async () => {
    const mockUser = {
      id: "user-123",
      username: "admin",
      createdAt: new Date(),
      isMaster: true,
    };

    mockIsAuthenticated.mockReturnValue(true);
    mockGetCurrentUser.mockReturnValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isMaster).toBe(true);
  });

  it("should return false for isMaster when user is not master", async () => {
    const mockUser = {
      id: "user-123",
      username: "user",
      createdAt: new Date(),
      isMaster: false,
    };

    mockIsAuthenticated.mockReturnValue(true);
    mockGetCurrentUser.mockReturnValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isMaster).toBe(false);
  });
});

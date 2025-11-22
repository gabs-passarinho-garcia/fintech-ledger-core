import { useState, useEffect, useCallback } from "react";
import {
  signIn as signInService,
  signUp as signUpService,
  signOut as signOutService,
  getCurrentUser,
  isAuthenticated as checkAuth,
  type SignInInput,
  type SignUpInput,
} from "../services/auth";
import type { SignInResponse, SignUpResponse, User } from "../types";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (input: SignInInput) => Promise<SignInResponse>;
  signUp: (input: SignUpInput) => Promise<SignUpResponse>;
  signOut: () => void;
  error: Error | null;
}

/**
 * Hook for managing authentication state
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuthStatus = (): void => {
      try {
        if (checkAuth()) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Auth check failed"));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = useCallback(
    async (input: SignInInput): Promise<SignInResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await signInService(input);
        const currentUser = getCurrentUser();
        setUser(currentUser);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Sign in failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signUp = useCallback(
    async (input: SignUpInput): Promise<SignUpResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        // After signup, user needs to sign in
        return await signUpService(input);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Sign up failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signOut = useCallback((): void => {
    signOutService();
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: checkAuth(), // Only check token, user can be loaded later
    isLoading,
    signIn,
    signUp,
    signOut,
    error,
  };
}

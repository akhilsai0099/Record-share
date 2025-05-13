import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchUser } from "@/actions/auth";
import { fetchUserQueryOptions } from "@/actions/queryOptions";

/**
 * Custom hook for fetching and managing the authenticated user
 * @param options Options to customize the query behavior
 * @returns Query result with authenticated user data and helper methods
 */
export function useAuthenticatedUser() {
  const query = useQuery(fetchUserQueryOptions());

  // Extract commonly used values
  const { data, isLoading, isError, error } = query;
  const user = data?.user;
  const session = data?.session;
  const isAuthenticated = !!user;

  // Return query results and helper values
  return {
    ...query,
    user,
    session,
    isAuthenticated,
    isLoading,
    isError,
    error,
  };
}

/**
 * Represents the user data structure
 */
export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the session data structure
 */
export interface Session {
  id: string;
  expiresAt: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

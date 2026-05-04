/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { createContext, createElement, useContext } from 'react';

const ConvexCtx = createContext<any>(null);

export class ConvexReactClient {
  constructor(_url: string, _options?: Record<string, unknown>) {}
  setAuth() {}
  clearAuth() {}
}

export const ConvexProvider = ({
  client: _client,
  children,
}: {
  client: ConvexReactClient;
  children?: React.ReactNode;
}) => createElement(ConvexCtx.Provider, { value: {} }, children);

export function useConvex() {
  return useContext(ConvexCtx);
}

export function useConvexAuth() {
  const authenticated =
    typeof window !== 'undefined' &&
    (
      (window as unknown as Record<string, unknown>).__E2E_AUTH__ as
        | { isAuthenticated: boolean }
        | undefined
    )?.isAuthenticated !== false;
  return { isLoading: false, isAuthenticated: authenticated };
}

/** Replacement for ConvexProvider that wires up auth — used by @convex-dev/auth */
export function ConvexProviderWithAuth({
  children,
  client: _client,
  useAuth: _useAuth,
}: {
  children?: React.ReactNode;
  client: ConvexReactClient;
  useAuth: () => {
    isLoading: boolean;
    isAuthenticated: boolean;
    fetchAccessToken: (args: {
      forceRefreshToken: boolean;
    }) => Promise<string | null>;
  };
}) {
  return createElement(ConvexCtx.Provider, { value: {} }, children);
}

export function useQuery(_query: unknown, ..._args: unknown[]) {
  return undefined;
}

export function useMutation(_mutation: unknown) {
  const fn = (async () => ({})) as any;
  fn.withOptimisticUpdate = () => fn;
  return fn;
}

export function useAction(_action: unknown) {
  return async () => ({});
}

export function useConvexConnectionState() {
  return 'Connected' as const;
}

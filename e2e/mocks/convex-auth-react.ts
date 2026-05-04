import { createContext, createElement, useContext } from 'react';

const AuthActionsCtx = createContext({
  signIn: async () => ({ signingIn: false }),
  signOut: async () => {},
});

export function ConvexAuthProvider({
  children,
}: {
  client?: unknown;
  children?: React.ReactNode;
}) {
  return createElement(
    AuthActionsCtx.Provider,
    {
      value: {
        signIn: async () => ({ signingIn: false }),
        signOut: async () => {},
      },
    },
    children,
  );
}

export function useAuthActions() {
  return useContext(AuthActionsCtx);
}

export function useConvexAuth() {
  return { isLoading: false, isAuthenticated: true };
}

export function useAuthToken() {
  return 'e2e-mock-token';
}

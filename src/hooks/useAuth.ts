import { useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import type { Doc } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);

  return {
    isLoading,
    isAuthenticated,
    user: user as Doc<'users'> | null | undefined,
    signIn,
    signOut,
  };
}

import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { Anonymous } from '@convex-dev/auth/providers/Anonymous';
import { convexAuth } from '@convex-dev/auth/server';

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google, Password, Anonymous],
});

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * Better-Auth client. Use in Client Components for:
 *   const { data: session } = authClient.useSession();
 *   await authClient.signIn.email({ email, password });
 *   await authClient.signUp.email({ email, password, name });
 *   await authClient.signOut();
 */
export const authClient = createAuthClient({
  // baseURL is auto-detected from window.location in the browser
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { LoginSplash } from "@/components/login-splash";
import { FrontendBottomNav, FrontendTopNav } from "@/components/frontend/top-nav";

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role;
  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
    role: role ?? "user",
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-60 [background:radial-gradient(60%_50%_at_0%_0%,oklch(0.96_0.05_60/.7),transparent_60%),radial-gradient(50%_50%_at_100%_10%,oklch(0.95_0.06_330/.65),transparent_60%),radial-gradient(70%_60%_at_50%_100%,oklch(0.96_0.05_220/.55),transparent_60%)] dark:opacity-30"
      />
      <LoginSplash />
      <FrontendTopNav user={user} />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">{children}</main>
      <FrontendBottomNav />
    </div>
  );
}

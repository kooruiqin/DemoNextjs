import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderUserMenu } from "@/components/header-user-menu";
import { PageTitle } from "@/components/page-title";
import { LoginSplash } from "@/components/login-splash";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role;
  const sidebarUser = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
    role: role ?? "user",
  };

  return (
    <>
      <LoginSplash />
      <SidebarProvider>
        <AppSidebar user={sidebarUser} isAdmin={isAdmin(role)} />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <PageTitle />
            </div>
            <div className="flex items-center gap-2 px-4">
              <Button asChild size="sm" variant="outline" className="hidden gap-1.5 sm:inline-flex">
                <Link href="/">
                  <Sparkles className="size-3.5" />
                  Switch to app
                </Link>
              </Button>
              <Button asChild size="icon" variant="outline" className="sm:hidden" aria-label="Switch to app">
                <Link href="/">
                  <Sparkles className="size-4" />
                </Link>
              </Button>
              <ThemeToggle />
              <HeaderUserMenu user={sidebarUser} />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

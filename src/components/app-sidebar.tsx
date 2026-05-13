"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FileText,
  User as UserIcon,
  Settings as SettingsIcon,
  Command,
  FileSearch,
  ListOrdered,
  Filter,
  SlidersHorizontal,
  Square,
  Bell,
  Pencil,
  CheckSquare,
  GripVertical,
  ChevronRight,
  PanelTop,
  MoveHorizontal,
  MessageCircle,
  Sigma,
  Table as TableIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

type NavItem = {
  title: string;
  href: Route;
  icon: React.ElementType;
  adminOnly?: boolean;
};

const platformNav: NavItem[] = [
  { title: "Dashboard", href: "/backend/dashboard" as Route, icon: LayoutDashboard },
  { title: "Analytics", href: "/backend/analytics" as Route, icon: BarChart3, adminOnly: true },
  { title: "Users", href: "/backend/users" as Route, icon: Users, adminOnly: true },
  { title: "Posts", href: "/backend/posts" as Route, icon: FileText },
];

const accountNav: NavItem[] = [
  { title: "Profile", href: "/backend/profile" as Route, icon: UserIcon },
  { title: "Settings", href: "/backend/settings" as Route, icon: SettingsIcon },
];

const examplesNav: NavItem[] = [
  { title: "Detail page", href: "/backend/examples/detail" as Route, icon: FileSearch },
  { title: "Wizard", href: "/backend/examples/wizard" as Route, icon: ListOrdered },
  { title: "Preferences", href: "/backend/examples/preferences" as Route, icon: SlidersHorizontal },
  { title: "Modal", href: "/backend/examples/modal" as Route, icon: Square },
  { title: "Toast", href: "/backend/examples/toast" as Route, icon: Bell },
  { title: "Chat", href: "/backend/examples/chat" as Route, icon: MessageCircle },
];

const tablesNav: NavItem[] = [
  { title: "Filter", href: "/backend/examples/filter-table" as Route, icon: Filter },
  { title: "Inline edit", href: "/backend/examples/edit-table" as Route, icon: Pencil },
  { title: "Row selection", href: "/backend/examples/select-table" as Route, icon: CheckSquare },
  { title: "Reorder rows", href: "/backend/examples/reorder-table" as Route, icon: GripVertical },
  { title: "Expandable rows", href: "/backend/examples/expand-table" as Route, icon: ChevronRight },
  { title: "Sticky header", href: "/backend/examples/sticky-header-table" as Route, icon: PanelTop },
  { title: "Horizontal scroll", href: "/backend/examples/scroll-table" as Route, icon: MoveHorizontal },
  { title: "Footer summary", href: "/backend/examples/footer-summary-table" as Route, icon: Sigma },
];

type Props = React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; image: string | null; role: string };
  isAdmin: boolean;
};

export function AppSidebar({ user, isAdmin, ...props }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const tablesActive = tablesNav.some((item) => isActive(item.href));
  const [tablesOpen, setTablesOpen] = React.useState(tablesActive);
  React.useEffect(() => {
    if (tablesActive) setTablesOpen(true);
  }, [tablesActive]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/backend/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Daily Mini</span>
                  <span className="truncate text-xs text-muted-foreground">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformNav
                .filter((item) => !item.adminOnly || isAdmin)
                .map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Examples</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {examplesNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setTablesOpen((o) => !o)}
                  isActive={tablesActive}
                  tooltip="Tables"
                  aria-expanded={tablesOpen}
                >
                  <TableIcon />
                  <span>Tables</span>
                  <ChevronRight
                    className={`ml-auto size-4 transition-transform ${tablesOpen ? "rotate-90" : ""}`}
                  />
                </SidebarMenuButton>
                {tablesOpen && (
                  <SidebarMenuSub>
                    {tablesNav.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.href)}>
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

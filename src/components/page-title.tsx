"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/backend/dashboard": "Dashboard",
  "/backend/analytics": "Analytics",
  "/backend/users": "Users",
  "/backend/posts": "Posts",
  "/backend/profile": "Profile",
  "/backend/settings": "Settings",
  "/backend/examples": "Examples",
};

export function PageTitle() {
  const pathname = usePathname();
  const match = Object.keys(TITLES).find(
    (k) => pathname === k || pathname.startsWith(k + "/"),
  );
  const title = match ? TITLES[match] : "App";
  return <span className="text-sm font-medium">{title}</span>;
}

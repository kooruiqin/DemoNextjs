"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/users": "Users",
  "/posts": "Posts",
  "/profile": "Profile",
  "/settings": "Settings",
};

export function PageTitle() {
  const pathname = usePathname();
  const match = Object.keys(TITLES).find(
    (k) => pathname === k || pathname.startsWith(k + "/"),
  );
  const title = match ? TITLES[match] : "App";
  return <span className="text-sm font-medium">{title}</span>;
}

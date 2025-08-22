"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  Package,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: Role;
  displayName: string;
}

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/activity", label: "Activity Log", icon: Activity },
];

const staffNav = [
  { href: "/staff", label: "My Assignments", icon: ClipboardList },
];

export function Sidebar({ role, displayName }: SidebarProps) {
  const pathname = usePathname();
  const nav = role === "ADMIN" ? adminNav : staffNav;

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold text-sm tracking-tight">Order Ops</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" || href === "/staff"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <p className="text-xs text-muted-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground/60">{role}</p>
      </div>
    </aside>
  );
}

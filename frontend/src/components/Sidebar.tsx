"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Lightbulb,
  DollarSign,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare, exact: false },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays, exact: false },
  { href: "/dashboard/idea-box", label: "Idea Box", icon: Lightbulb, exact: false },
  { href: "/dashboard/finance", label: "Finance", icon: DollarSign, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const avatarColor = "bg-primary/20 text-primary";

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="w-5 h-5 rounded-sm bg-primary/90 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white leading-none">✦</span>
        </div>
        <span className="text-sm font-semibold tracking-wide text-foreground">Ascend</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0",
              avatarColor
            )}
          >
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-foreground truncate">{user?.username}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

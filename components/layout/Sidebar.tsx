"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  TrendingUp,
  Upload,
  Settings,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/catalog", label: "Catalog", icon: BookOpen },
  { href: "/intelligence", label: "Intelligence", icon: TrendingUp },
  { href: "/upload", label: "Data Upload", icon: Upload },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-navy flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-navy-light">
        <div className="w-9 h-9 bg-amber rounded-lg flex items-center justify-center flex-shrink-0">
          <DoorOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">Frontier</div>
          <div className="text-amber text-xs leading-tight">Sales Intelligence</div>
        </div>
      </div>

      {/* Rep Badge */}
      <div className="px-4 py-3 border-b border-navy-light">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy-light flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">JA</span>
          </div>
          <div>
            <div className="text-white text-sm font-medium">Jordan Alvarez</div>
            <div className="text-slate-400 text-xs">Pacific Northwest</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-amber text-white"
                  : "text-slate-300 hover:bg-navy-light hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="px-3 pb-4 border-t border-navy-light pt-3 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-amber text-white"
                  : "text-slate-300 hover:bg-navy-light hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
        <div className="px-3 py-2 text-slate-500 text-xs">
          FDC Sales Intel v1.0
        </div>
      </div>
    </aside>
  );
}

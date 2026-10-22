"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Target,
  TrendingUp,
  FileText,
  LogOut,
  Menu,
  X,
  Layers,
  ChevronRight,
  Shield,
  Eye,
  BarChart2,
} from "lucide-react";
import { useStrataStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/mock-data";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "analyst", "viewer"] },
  { href: "/data-sources", label: "Data Sources", icon: Database, roles: ["admin"] },
  { href: "/kpi-builder", label: "KPI Builder", icon: Target, roles: ["admin", "analyst"] },
  { href: "/trends", label: "Trends & Anomalies", icon: TrendingUp, roles: ["admin", "analyst", "viewer"] },
  { href: "/reports", label: "Reports", icon: FileText, roles: ["admin", "analyst", "viewer"] },
];

const roleConfig: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
  admin: { label: "Admin", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: <Shield className="w-3 h-3" /> },
  analyst: { label: "Analyst", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <BarChart2 className="w-3 h-3" /> },
  viewer: { label: "Viewer", color: "bg-slate-500/20 text-slate-300 border-slate-500/30", icon: <Eye className="w-3 h-3" /> },
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, sidebarOpen, setSidebarOpen, logout } = useStrataStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const visibleItems = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700/50 z-30 transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 min-h-[64px]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg">Strata</span>
                <div className="text-slate-400 text-xs">Data Intelligence</div>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "text-slate-400 hover:text-white transition-colors",
              !sidebarOpen && "hidden"
            )}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle for desktop */}
        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 w-full transition-colors"
          >
            <Menu className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>

        {/* User profile */}
        {user && (
          <div className={cn(
            "p-3 border-t border-slate-700/50",
            !sidebarOpen && "px-2"
          )}>
            {sidebarOpen ? (
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">{user.name}</div>
                    <div className="text-slate-400 text-xs truncate">{user.email}</div>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs mb-2 w-fit",
                  roleConfig[user.role].color
                )}>
                  {roleConfig[user.role].icon}
                  {roleConfig[user.role].label}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs transition-colors w-full"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full py-2 text-slate-400 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

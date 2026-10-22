"use client";

import { useStrataStore } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useStrataStore();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}
      >
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-slate-900">Strata</span>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

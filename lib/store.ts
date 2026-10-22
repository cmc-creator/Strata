"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DataLayer, UserRole } from "./mock-data";

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface StrataStore {
  user: User | null;
  activeLayer: DataLayer;
  selectedKPIIds: string[];
  dateRange: { start: string; end: string };
  sidebarOpen: boolean;

  setUser: (user: User | null) => void;
  setActiveLayer: (layer: DataLayer) => void;
  toggleKPI: (kpiId: string) => void;
  setDateRange: (range: { start: string; end: string }) => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useStrataStore = create<StrataStore>()(
  persist(
    (set) => ({
      user: null,
      activeLayer: "financial",
      selectedKPIIds: ["kpi-1", "kpi-2", "kpi-3"],
      dateRange: { start: "2024-01", end: "2024-12" },
      sidebarOpen: true,

      setUser: (user) => set({ user }),
      setActiveLayer: (layer) => set({ activeLayer: layer }),
      toggleKPI: (kpiId) =>
        set((state) => ({
          selectedKPIIds: state.selectedKPIIds.includes(kpiId)
            ? state.selectedKPIIds.filter((id) => id !== kpiId)
            : [...state.selectedKPIIds, kpiId],
        })),
      setDateRange: (range) => set({ dateRange: range }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      logout: () => set({ user: null }),
    }),
    {
      name: "strata-store",
      partialize: (state) => ({
        user: state.user,
        activeLayer: state.activeLayer,
        selectedKPIIds: state.selectedKPIIds,
        dateRange: state.dateRange,
      }),
    }
  )
);

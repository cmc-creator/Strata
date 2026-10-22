"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStrataStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { UserRole } from "@/lib/mock-data";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { user } = useStrataStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, requiredRoles, router]);

  if (!user) return null;
  if (requiredRoles && !requiredRoles.includes(user.role)) return null;

  return <AppShell>{children}</AppShell>;
}

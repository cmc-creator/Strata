"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layers, Eye, EyeOff, Shield, BarChart2 } from "lucide-react";
import { useStrataStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/mock-data";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["admin", "analyst", "viewer"]),
});

type LoginForm = z.infer<typeof loginSchema>;

const roleOptions: { value: UserRole; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    value: "admin",
    label: "Administrator",
    description: "Full access to all features, data sources, and settings",
    icon: <Shield className="w-5 h-5" />,
    color: "border-purple-500 bg-purple-500/10 text-purple-700",
  },
  {
    value: "analyst",
    label: "Analyst",
    description: "Access to dashboards, KPI builder, trends, and reports",
    icon: <BarChart2 className="w-5 h-5" />,
    color: "border-blue-500 bg-blue-500/10 text-blue-700",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to dashboards, trends, and reports",
    icon: <Eye className="w-5 h-5" />,
    color: "border-slate-400 bg-slate-100 text-slate-700",
  },
];

const demoAccounts: Record<UserRole, { email: string; name: string }> = {
  admin: { email: "admin@strata.io", name: "Alex Chen" },
  analyst: { email: "analyst@strata.io", name: "Morgan Lee" },
  viewer: { email: "viewer@strata.io", name: "Jordan Taylor" },
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStrataStore();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "admin", email: "admin@strata.io", password: "demo" },
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setValue("role", role);
    setValue("email", demoAccounts[role].email);
  };

  const onSubmit = async (data: LoginForm) => {
    await new Promise((r) => setTimeout(r, 600));
    const account = demoAccounts[data.role];
    setUser({ name: account.name, email: data.email, role: data.role });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Strata</h1>
          <p className="text-slate-400 mt-1">Layered Data Intelligence Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Sign in to your account</h2>

          {/* Role selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Role</label>
            <div className="space-y-2">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleRoleSelect(opt.value)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all",
                    selectedRole === opt.value
                      ? opt.color + " border-current"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0",
                    selectedRole === opt.value ? "" : "text-slate-400"
                  )}>
                    {opt.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("role")} />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                className={cn(
                  "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors.email ? "border-red-300" : "border-slate-300"
                )}
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10",
                    errors.password ? "border-red-300" : "border-slate-300"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">Demo: any password works</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            This is a demo application. All data is simulated.
          </p>
        </div>
      </div>
    </div>
  );
}

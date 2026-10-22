"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { mockKPIs, KPI, KPIStatus, DataLayer } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

const numericField = () =>
  z.union([z.string(), z.number()]).transform((v) => (v === "" ? 0 : Number(v)));

const kpiSchema = z.object({
  name: z.string().min(2, "Name required"),
  description: z.string().min(5, "Description required"),
  formula: z.string().min(3, "Formula required"),
  currentValue: numericField(),
  targetValue: numericField(),
  warningThreshold: numericField(),
  criticalThreshold: numericField(),
  unit: z.enum(["currency", "percentage", "score", "count", "hours"]),
  dataSource: z.string().min(1, "Data source required"),
  layer: z.enum(["financial", "operations", "customer", "hr"]),
});

type KPIForm = {
  name: string;
  description: string;
  formula: string;
  currentValue: number;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  unit: "currency" | "percentage" | "score" | "count" | "hours";
  dataSource: string;
  layer: "financial" | "operations" | "customer" | "hr";
};

const statusConfig: Record<KPIStatus, { icon: React.ReactNode; label: string; classes: string }> = {
  "on-track": {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: "On Track",
    classes: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  warning: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: "Warning",
    classes: "bg-amber-100 text-amber-700 border-amber-200",
  },
  critical: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: "Critical",
    classes: "bg-red-100 text-red-700 border-red-200",
  },
};

const layerColors: Record<DataLayer, string> = {
  financial: "bg-emerald-100 text-emerald-700",
  operations: "bg-blue-100 text-blue-700",
  customer: "bg-orange-100 text-orange-700",
  hr: "bg-purple-100 text-purple-700",
};

function formatKPIValue(value: number, unit: string): string {
  switch (unit) {
    case "currency": return formatCurrency(value);
    case "percentage": return `${value.toFixed(1)}%`;
    case "hours": return `${value.toFixed(1)}h`;
    default: return value.toLocaleString();
  }
}

function getKPIStatus(current: number, target: number, warning: number, critical: number): KPIStatus {
  // For KPIs where lower is better (warning/critical thresholds are above target)
  if (warning > target) {
    if (current >= critical) return "critical";
    if (current >= warning) return "warning";
    return "on-track";
  }
  // For KPIs where higher is better
  if (current <= critical) return "critical";
  if (current <= warning) return "warning";
  return "on-track";
}

function ProgressBar({ current, target, warning, critical, unit }: {
  current: number; target: number; warning: number; critical: number; unit: string;
}) {
  const max = Math.max(current, target, warning, critical) * 1.1;
  const pct = (v: number) => Math.min(100, (v / max) * 100);

  return (
    <div className="mt-2">
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${pct(current)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>0</span>
        <span>Target: {formatKPIValue(target, unit)}</span>
      </div>
    </div>
  );
}

export default function KPIBuilderPage() {
  return (
    <AuthGuard requiredRoles={["admin", "analyst"]}>
      <KPIBuilderContent />
    </AuthGuard>
  );
}

function KPIBuilderContent() {
  const [kpis, setKpis] = useState<KPI[]>(mockKPIs);
  const [showModal, setShowModal] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [filterLayer, setFilterLayer] = useState<DataLayer | "all">("all");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<KPIForm>({ resolver: zodResolver(kpiSchema) as any });

  const openCreate = () => {
    setEditingKPI(null);
    reset({});
    setShowModal(true);
  };

  const openEdit = (kpi: KPI) => {
    setEditingKPI(kpi);
    reset({
      name: kpi.name,
      description: kpi.description,
      formula: kpi.formula,
      currentValue: kpi.currentValue,
      targetValue: kpi.targetValue,
      warningThreshold: kpi.warningThreshold,
      criticalThreshold: kpi.criticalThreshold,
      unit: kpi.unit as KPIForm["unit"],
      dataSource: kpi.dataSource,
      layer: kpi.layer,
    });
    setShowModal(true);
  };

  const onSubmit = (data: KPIForm) => {
    const status = getKPIStatus(data.currentValue, data.targetValue, data.warningThreshold, data.criticalThreshold);
    if (editingKPI) {
      setKpis((prev) =>
        prev.map((k) =>
          k.id === editingKPI.id ? { ...k, ...data, status, trend: k.trend } : k
        )
      );
    } else {
      const newKPI: KPI = {
        id: `kpi-${Date.now()}`,
        ...data,
        status,
        trend: 0,
        history: [],
      };
      setKpis((prev) => [...prev, newKPI]);
    }
    setShowModal(false);
    reset();
  };

  const deleteKPI = (id: string) => {
    setKpis((prev) => prev.filter((k) => k.id !== id));
  };

  const filtered = filterLayer === "all" ? kpis : kpis.filter((k) => k.layer === filterLayer);

  const stats = {
    total: kpis.length,
    onTrack: kpis.filter((k) => k.status === "on-track").length,
    warning: kpis.filter((k) => k.status === "warning").length,
    critical: kpis.filter((k) => k.status === "critical").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KPI Builder</h1>
          <p className="text-slate-500 text-sm mt-0.5">Define and track your key performance indicators</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New KPI
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total KPIs", value: stats.total, color: "text-slate-700 bg-slate-50 border-slate-200" },
          { label: "On Track", value: stats.onTrack, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "Warning", value: stats.warning, color: "text-amber-700 bg-amber-50 border-amber-200" },
          { label: "Critical", value: stats.critical, color: "text-red-700 bg-red-50 border-red-200" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl border p-4 text-center", s.color.split(" ").slice(1).join(" "))}>
            <div className={cn("text-3xl font-bold", s.color.split(" ")[0])}>{s.value}</div>
            <div className="text-sm text-slate-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "financial", "operations", "customer", "hr"] as const).map((layer) => (
          <button
            key={layer}
            onClick={() => setFilterLayer(layer)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors",
              filterLayer === layer
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            {layer === "all" ? "All Layers" : layer}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((kpi) => {
          const status = statusConfig[kpi.status];
          return (
            <div key={kpi.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{kpi.name}</h3>
                    <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", status.classes)}>
                      {status.icon}
                      {status.label}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", layerColors[kpi.layer])}>
                      {kpi.layer}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{kpi.description}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => openEdit(kpi)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteKPI(kpi.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-2xl font-bold text-slate-900">
                    {formatKPIValue(kpi.currentValue, kpi.unit)}
                  </span>
                  <span className="text-sm text-slate-400 ml-2">
                    / {formatKPIValue(kpi.targetValue, kpi.unit)} target
                  </span>
                </div>
                <span className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  kpi.trend > 0 ? "text-emerald-600" : kpi.trend < 0 ? "text-red-500" : "text-slate-400"
                )}>
                  {kpi.trend > 0 ? <TrendingUp className="w-4 h-4" /> : kpi.trend < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                  {kpi.trend !== 0 && `${Math.abs(kpi.trend).toFixed(1)}%`}
                </span>
              </div>

              <ProgressBar
                current={kpi.currentValue}
                target={kpi.targetValue}
                warning={kpi.warningThreshold}
                critical={kpi.criticalThreshold}
                unit={kpi.unit}
              />

              <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                <span>Formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">{kpi.formula}</code></span>
                <span>{kpi.dataSource}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingKPI ? "Edit KPI" : "Create New KPI"}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">KPI Name</label>
                  <input
                    {...register("name")}
                    className={cn("w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", errors.name ? "border-red-300" : "border-slate-300")}
                    placeholder="e.g. Monthly Recurring Revenue"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    className={cn("w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", errors.description ? "border-red-300" : "border-slate-300")}
                    placeholder="Brief description of what this KPI measures"
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Formula</label>
                  <input
                    {...register("formula")}
                    className={cn("w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500", errors.formula ? "border-red-300" : "border-slate-300")}
                    placeholder="SUM(revenue) / COUNT(customers)"
                  />
                  {errors.formula && <p className="mt-1 text-xs text-red-600">{errors.formula.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    {...register("unit")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="currency">Currency ($)</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="score">Score</option>
                    <option value="count">Count</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Layer</label>
                  <select
                    {...register("layer")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="financial">Financial</option>
                    <option value="operations">Operations</option>
                    <option value="customer">Customer</option>
                    <option value="hr">HR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Value</label>
                  <input
                    {...register("currentValue")}
                    type="number"
                    step="any"
                    className={cn("w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", errors.currentValue ? "border-red-300" : "border-slate-300")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Value</label>
                  <input
                    {...register("targetValue")}
                    type="number"
                    step="any"
                    className={cn("w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", errors.targetValue ? "border-red-300" : "border-slate-300")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Warning Threshold</label>
                  <input
                    {...register("warningThreshold")}
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Critical Threshold</label>
                  <input
                    {...register("criticalThreshold")}
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Source</label>
                  <select
                    {...register("dataSource")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="Salesforce">Salesforce</option>
                    <option value="Google Analytics">Google Analytics</option>
                    <option value="CSV Upload">CSV Upload</option>
                    <option value="REST API">REST API</option>
                    <option value="MySQL">MySQL</option>
                  </select>
                  {errors.dataSource && <p className="mt-1 text-xs text-red-600">{errors.dataSource.message}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {editingKPI ? "Save Changes" : "Create KPI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

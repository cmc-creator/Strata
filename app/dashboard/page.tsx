"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useStrataStore } from "@/lib/store";
import {
  mockDashboardMetrics,
  mockAnomalies,
  multiSeriesData,
  DataLayer,
} from "@/lib/mock-data";
import { cn, formatNumber } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  DollarSign,
  Settings,
  Users,
  Activity,
} from "lucide-react";

const layerConfig: Record<DataLayer, { label: string; color: string; icon: React.ReactNode }> = {
  financial: { label: "Financial", color: "bg-emerald-500", icon: <DollarSign className="w-4 h-4" /> },
  operations: { label: "Operations", color: "bg-blue-500", icon: <Settings className="w-4 h-4" /> },
  customer: { label: "Customer", color: "bg-orange-500", icon: <Users className="w-4 h-4" /> },
  hr: { label: "HR", color: "bg-purple-500", icon: <Activity className="w-4 h-4" /> },
};

const severityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

function KPICard({ metric }: { metric: (typeof mockDashboardMetrics.financial)[0] }) {
  const TrendIcon =
    metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    metric.trend === "up"
      ? metric.label.toLowerCase().includes("churn") || metric.label.toLowerCase().includes("cost") || metric.label.toLowerCase().includes("attrition")
        ? "text-red-500"
        : "text-emerald-500"
      : metric.trend === "down"
      ? metric.label.toLowerCase().includes("churn") || metric.label.toLowerCase().includes("cost") || metric.label.toLowerCase().includes("attrition") || metric.label.toLowerCase().includes("error")
        ? "text-emerald-500"
        : "text-red-500"
      : "text-slate-500";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{metric.label}</p>
        <span className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          {Math.abs(metric.change).toFixed(1)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
      <p className="text-xs text-slate-400 mt-1">vs. previous period</p>
    </div>
  );
}

const CHART_COLORS = {
  revenue: "#3b82f6",
  expenses: "#f59e0b",
  customers: "#8b5cf6",
  nps: "#10b981",
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { activeLayer, setActiveLayer } = useStrataStore();
  const metrics = mockDashboardMetrics[activeLayer];

  const chartData = multiSeriesData.map((d) => ({
    ...d,
    month: d.month,
    revenue: Math.round(d.revenue / 1000),
    expenses: Math.round(d.expenses / 1000),
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Layered analytics overview — FY 2024</p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          Last updated: Dec 1, 2024
        </div>
      </div>

      {/* Layer toggles */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(layerConfig) as DataLayer[]).map((layer) => {
          const config = layerConfig[layer];
          return (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                activeLayer === layer
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", config.color)} />
              {config.icon}
              {config.label}
            </button>
          );
        })}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <KPICard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Revenue vs Expenses</h3>
          <p className="text-xs text-slate-500 mb-4">Monthly comparison (in $K) — 2024</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(value, seriesName) => [
                  `$${Number(value)}K`,
                  String(seriesName).charAt(0).toUpperCase() + String(seriesName).slice(1),
                ]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.revenue} strokeWidth={2} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke={CHART_COLORS.expenses} strokeWidth={2} dot={false} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Customer growth */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Customer Growth</h3>
          <p className="text-xs text-slate-500 mb-4">Monthly active customers — 2024</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={multiSeriesData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(value) => [formatNumber(Number(value)), "Customers"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="customers" fill={CHART_COLORS.customers} radius={[4, 4, 0, 0]} name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomalies panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900">Recent Anomaly Detections</h3>
          <span className="ml-auto text-xs text-slate-500">{mockAnomalies.length} total this year</span>
        </div>
        <div className="space-y-2">
          {mockAnomalies.slice(0, 5).map((anomaly) => (
            <div
              key={anomaly.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
            >
              <span
                className={cn(
                  "flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
                  severityColors[anomaly.severity]
                )}
              >
                {anomaly.severity}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-900">{anomaly.metric}</span>
                  <span className="text-xs text-slate-400">{anomaly.date}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{anomaly.description}</p>
              </div>
              <div className="text-right text-xs flex-shrink-0">
                <div className={cn("font-semibold", anomaly.deviation > 0 ? "text-red-600" : "text-emerald-600")}>
                  {anomaly.deviation > 0 ? "+" : ""}{anomaly.deviation.toFixed(1)}%
                </div>
                <div className="text-slate-400">deviation</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

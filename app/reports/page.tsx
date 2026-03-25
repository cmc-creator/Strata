"use client";

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
  FileText,
  Printer,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Minus,
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useStrataStore } from "@/lib/store";
import {
  mockKPIs,
  mockReportInsights,
  multiSeriesData,
  mockDashboardMetrics,
} from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

const impactConfig = {
  positive: { icon: <TrendingUp className="w-4 h-4" />, classes: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  negative: { icon: <TrendingDown className="w-4 h-4" />, classes: "bg-red-50 border-red-200 text-red-800" },
  neutral: { icon: <Minus className="w-4 h-4" />, classes: "bg-slate-50 border-slate-200 text-slate-700" },
};

const kpiStatusIcons = {
  "on-track": <CheckCircle className="w-4 h-4 text-emerald-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  critical: <XCircle className="w-4 h-4 text-red-500" />,
};

const chartData = multiSeriesData.map((d) => ({
  ...d,
  revenue: Math.round(d.revenue / 1000),
  expenses: Math.round(d.expenses / 1000),
}));

export default function ReportsPage() {
  return (
    <AuthGuard>
      <ReportsContent />
    </AuthGuard>
  );
}

function ReportsContent() {
  const { user } = useStrataStore();
  const isViewer = user?.role === "viewer";

  const visibleKPIs = isViewer ? mockKPIs.filter((k) => k.layer !== "hr") : mockKPIs;
  const visibleInsights = isViewer
    ? mockReportInsights.filter((i) => i.category !== "Financial Performance")
    : mockReportInsights;

  const financialMetrics = mockDashboardMetrics.financial;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Summary Report</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Annual performance overview — FY 2024
            {isViewer && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                Limited view
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Printer className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Report document */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none" id="report">
        {/* Report header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">Strata Analytics</h2>
              <p className="text-slate-300 mt-1">Executive Summary — FY 2024</p>
              <p className="text-slate-400 text-sm mt-3">Generated: December 1, 2024</p>
            </div>
            <div className="text-right">
              <div className="text-slate-300 text-sm">Prepared for</div>
              <div className="text-white font-semibold">{user?.name}</div>
              <div className="text-slate-400 text-xs capitalize mt-1">{user?.role} access</div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Executive highlights */}
          {!isViewer && (
            <section>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Executive Highlights
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {financialMetrics.map((m) => (
                  <div key={m.id} className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-xl font-bold text-slate-900">{m.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{m.label}</div>
                    <div className={cn(
                      "text-xs font-medium mt-1",
                      m.trend === "up" ? "text-emerald-600" : m.trend === "down" ? "text-red-500" : "text-slate-500"
                    )}>
                      {m.trend === "up" ? "▲" : m.trend === "down" ? "▼" : "—"} {Math.abs(m.change).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Revenue chart */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
              Revenue & Expense Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(v, name) => [`$${Number(v)}K`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                  contentStyle={{ borderRadius: "8px", fontSize: 11 }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} dot={false} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* Customer chart */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
              Customer Growth
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={multiSeriesData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: 11 }} />
                <Bar dataKey="customers" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* KPI summary */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
              KPI Performance Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">KPI</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Current</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Target</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Layer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleKPIs.map((kpi) => (
                    <tr key={kpi.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{kpi.name}</td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {kpi.unit === "currency"
                          ? formatCurrency(kpi.currentValue)
                          : kpi.unit === "percentage"
                          ? `${kpi.currentValue.toFixed(1)}%`
                          : kpi.unit === "hours"
                          ? `${kpi.currentValue.toFixed(1)}h`
                          : kpi.currentValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {kpi.unit === "currency"
                          ? formatCurrency(kpi.targetValue)
                          : kpi.unit === "percentage"
                          ? `${kpi.targetValue.toFixed(1)}%`
                          : kpi.unit === "hours"
                          ? `${kpi.targetValue.toFixed(1)}h`
                          : kpi.targetValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {kpiStatusIcons[kpi.status]}
                          <span className="capitalize text-xs text-slate-600">{kpi.status.replace("-", " ")}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full capitalize font-medium",
                          kpi.layer === "financial" ? "bg-emerald-100 text-emerald-700" :
                          kpi.layer === "operations" ? "bg-blue-100 text-blue-700" :
                          kpi.layer === "customer" ? "bg-orange-100 text-orange-700" :
                          "bg-purple-100 text-purple-700"
                        )}>
                          {kpi.layer}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Insights */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
              Key Insights & Recommendations
            </h3>
            <div className="space-y-3">
              {visibleInsights.map((insight) => {
                const cfg = impactConfig[insight.impact];
                return (
                  <div
                    key={insight.id}
                    className={cn("flex gap-3 p-4 rounded-lg border", cfg.classes)}
                  >
                    <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                    <div>
                      <div className="font-semibold text-sm mb-1">{insight.category}</div>
                      <p className="text-sm">{insight.insight}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            <p>This report was generated by Strata Analytics Platform on December 1, 2024.</p>
            <p className="mt-1">All data is confidential and intended for internal use only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Dot,
} from "recharts";
import { AlertTriangle, Calendar, TrendingUp, Filter } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { mockAnomalies, multiSeriesData, DataLayer } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const severityColors = {
  high: { badge: "bg-red-100 text-red-700 border-red-200", dot: "#ef4444" },
  medium: { badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "#f59e0b" },
  low: { badge: "bg-blue-100 text-blue-700 border-blue-200", dot: "#3b82f6" },
};

const layerColors: Record<DataLayer, string> = {
  financial: "bg-emerald-100 text-emerald-700",
  operations: "bg-blue-100 text-blue-700",
  customer: "bg-orange-100 text-orange-700",
  hr: "bg-purple-100 text-purple-700",
};

const metrics = [
  { key: "revenue", label: "Revenue ($K)", color: "#3b82f6", yAxisId: "left" },
  { key: "expenses", label: "Expenses ($K)", color: "#f59e0b", yAxisId: "left" },
  { key: "nps", label: "NPS Score", color: "#10b981", yAxisId: "right" },
  { key: "churnRate", label: "Churn Rate (%)", color: "#ef4444", yAxisId: "right" },
];

const chartData = multiSeriesData.map((d) => ({
  ...d,
  revenue: Math.round(d.revenue / 1000),
  expenses: Math.round(d.expenses / 1000),
}));

function CustomDot(props: {
  cx?: number; cy?: number; payload?: { revenueAnomaly?: boolean };
  dataKey?: string;
}) {
  const { cx = 0, cy = 0, payload, dataKey } = props;
  if (dataKey === "revenue" && payload?.revenueAnomaly) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#ef4444"
        stroke="white"
        strokeWidth={2}
        className="animate-pulse"
      />
    );
  }
  return <Dot cx={cx} cy={cy} r={3} fill="#3b82f6" stroke="none" />;
}

export default function TrendsPage() {
  return (
    <AuthGuard>
      <TrendsContent />
    </AuthGuard>
  );
}

function TrendsContent() {
  const [activeMetrics, setActiveMetrics] = useState(["revenue", "expenses"]);
  const [layerFilter, setLayerFilter] = useState<DataLayer | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const filteredAnomalies = mockAnomalies.filter((a) => {
    if (layerFilter !== "all" && a.layer !== layerFilter) return false;
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    return true;
  });

  const anomalyDates = mockAnomalies
    .filter((a) => activeMetrics.some((m) => a.metric.toLowerCase().includes(m.toLowerCase().slice(0, 5))))
    .map((a) => a.date.slice(0, 7));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trends & Anomaly Detection</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Time series analysis with automatic anomaly highlighting
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          Jan 2024 — Dec 2024
        </div>
      </div>

      {/* Metric toggles */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Metric Selection</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                activeMetrics.includes(m.key)
                  ? "border-current text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
              )}
              style={activeMetrics.includes(m.key) ? { backgroundColor: m.color, borderColor: m.color } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeMetrics.includes(m.key) ? "white" : m.color }}
              />
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm" />
            Red dots indicate detected anomalies
          </span>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Legend />
            {anomalyDates.map((date) => (
              <ReferenceLine
                key={date}
                x={chartData.find((d) => d.date === date)?.month}
                yAxisId="left"
                stroke="#ef4444"
                strokeDasharray="4 2"
                strokeOpacity={0.4}
              />
            ))}
            {metrics.filter((m) => activeMetrics.includes(m.key)).map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                stroke={m.color}
                strokeWidth={2}
                yAxisId={m.yAxisId}
                name={m.label}
                dot={m.key === "revenue" ? <CustomDot dataKey={m.key} /> : false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-slate-900">Anomaly Detection Summary</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredAnomalies.length} events
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={layerFilter}
              onChange={(e) => setLayerFilter(e.target.value as DataLayer | "all")}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Layers</option>
              <option value="financial">Financial</option>
              <option value="operations">Operations</option>
              <option value="customer">Customer</option>
              <option value="hr">HR</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-tl-lg">Metric</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Layer</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deviation</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-tr-lg">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnomalies.map((anomaly) => (
                <tr key={anomaly.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{anomaly.metric}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{anomaly.date}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", layerColors[anomaly.layer])}>
                      {anomaly.layer}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-right font-mono">
                    {anomaly.value.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 text-right font-mono">
                    {anomaly.expectedValue.toLocaleString()}
                  </td>
                  <td className={cn(
                    "px-4 py-3 text-sm text-right font-semibold font-mono",
                    anomaly.deviation > 0 ? "text-red-600" : "text-emerald-600"
                  )}>
                    {anomaly.deviation > 0 ? "+" : ""}{anomaly.deviation.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
                      severityColors[anomaly.severity].badge
                    )}>
                      {anomaly.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">{anomaly.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

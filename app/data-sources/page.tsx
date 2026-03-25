"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Database,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  Globe,
  FileSpreadsheet,
  Wifi,
  X,
  AlertCircle,
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { mockDataSources, DataSource } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const sourceTypeIcons: Record<DataSource["type"], React.ReactNode> = {
  postgresql: <Server className="w-5 h-5" />,
  mysql: <Server className="w-5 h-5" />,
  salesforce: <Globe className="w-5 h-5" />,
  "google-analytics": <Globe className="w-5 h-5" />,
  csv: <FileSpreadsheet className="w-5 h-5" />,
  "rest-api": <Wifi className="w-5 h-5" />,
};

const sourceTypeColors: Record<DataSource["type"], string> = {
  postgresql: "bg-blue-100 text-blue-700",
  mysql: "bg-orange-100 text-orange-700",
  salesforce: "bg-sky-100 text-sky-700",
  "google-analytics": "bg-amber-100 text-amber-700",
  csv: "bg-green-100 text-green-700",
  "rest-api": "bg-purple-100 text-purple-700",
};

const statusConfig = {
  connected: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600", label: "Connected" },
  disconnected: { icon: <XCircle className="w-4 h-4" />, color: "text-red-500", label: "Disconnected" },
  syncing: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: "text-blue-500", label: "Syncing" },
};

const addSourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["postgresql", "mysql", "salesforce", "google-analytics", "csv", "rest-api"]),
  host: z.string().optional(),
  database: z.string().optional(),
  schema: z.string().optional(),
});

type AddSourceForm = z.infer<typeof addSourceSchema>;

function formatRecordCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M records`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K records`;
  return `${count} records`;
}

function formatSyncTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export default function DataSourcesPage() {
  return (
    <AuthGuard requiredRoles={["admin"]}>
      <DataSourcesContent />
    </AuthGuard>
  );
}

function DataSourcesContent() {
  const [sources, setSources] = useState<DataSource[]>(mockDataSources);
  const [showModal, setShowModal] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddSourceForm>({ resolver: zodResolver(addSourceSchema) });

  const selectedType = watch("type");

  const onAddSource = (data: AddSourceForm) => {
    const newSource: DataSource = {
      id: `ds-${Date.now()}`,
      name: data.name,
      type: data.type,
      status: "disconnected",
      lastSync: new Date().toISOString(),
      recordCount: 0,
      host: data.host,
      database: data.database,
      schema: data.schema,
    };
    setSources((prev) => [...prev, newSource]);
    setShowModal(false);
    reset();
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    await new Promise((r) => setTimeout(r, 1800));
    setSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "connected", lastSync: new Date().toISOString() }
          : s
      )
    );
    setSyncingId(null);
  };

  const handleDelete = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const connectedCount = sources.filter((s) => s.status === "connected").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Sources</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {connectedCount} of {sources.length} sources connected
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Connected", value: sources.filter((s) => s.status === "connected").length, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Syncing", value: sources.filter((s) => s.status === "syncing").length, color: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Disconnected", value: sources.filter((s) => s.status === "disconnected").length, color: "text-red-600 bg-red-50 border-red-100" },
        ].map((card) => (
          <div key={card.label} className={cn("rounded-xl border p-4 text-center", card.color.split(" ").slice(1).join(" "))}>
            <div className={cn("text-3xl font-bold", card.color.split(" ")[0])}>{card.value}</div>
            <div className="text-sm text-slate-600 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Sources list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Records</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Sync</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((source) => {
                const status = syncingId === source.id ? statusConfig.syncing : statusConfig[source.status];
                const displayStatus = syncingId === source.id ? "syncing" : source.status;
                return (
                  <tr key={source.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", sourceTypeColors[source.type])}>
                          {sourceTypeIcons[source.type]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{source.name}</div>
                          {source.host && <div className="text-xs text-slate-400">{source.host}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full capitalize", sourceTypeColors[source.type])}>
                        {source.type.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("flex items-center gap-1.5 text-sm font-medium", status.color)}>
                        {status.icon}
                        {displayStatus === "syncing" ? "Syncing..." : status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatRecordCount(source.recordCount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatSyncTime(source.lastSync)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSync(source.id)}
                          disabled={syncingId === source.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={cn("w-3 h-3", syncingId === source.id && "animate-spin")} />
                          Sync
                        </button>
                        <button
                          onClick={() => handleDelete(source.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Source Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">Add Data Source</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onAddSource)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Name</label>
                <input
                  {...register("name")}
                  className={cn("w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", errors.name ? "border-red-300" : "border-slate-300")}
                  placeholder="e.g. Production Database"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Type</label>
                <select
                  {...register("type")}
                  className={cn("w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", errors.type ? "border-red-300" : "border-slate-300")}
                >
                  <option value="">Select type...</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="salesforce">Salesforce</option>
                  <option value="google-analytics">Google Analytics</option>
                  <option value="csv">CSV Upload</option>
                  <option value="rest-api">REST API</option>
                </select>
                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>}
              </div>

              {(selectedType === "postgresql" || selectedType === "mysql") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Host</label>
                    <input
                      {...register("host")}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="db.example.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Database</label>
                      <input
                        {...register("database")}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="mydb"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Schema</label>
                      <input
                        {...register("schema")}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="public"
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedType === "rest-api" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">API Endpoint</label>
                  <input
                    {...register("host")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://api.example.com/v1"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700">Credentials are handled securely. This is a demo — no real connection will be made.</p>
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
                  Add Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

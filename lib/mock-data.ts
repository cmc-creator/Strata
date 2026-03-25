export type DataLayer = "financial" | "operations" | "customer" | "hr";
export type KPIStatus = "on-track" | "warning" | "critical";
export type AnomalySeverity = "low" | "medium" | "high";
export type SourceStatus = "connected" | "disconnected" | "syncing";
export type UserRole = "admin" | "analyst" | "viewer";

export interface TimeSeriesPoint {
  date: string;
  value: number;
  isAnomaly?: boolean;
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  formula: string;
  currentValue: number;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
  trend: number;
  status: KPIStatus;
  dataSource: string;
  layer: DataLayer;
  history: TimeSeriesPoint[];
}

export interface DataSource {
  id: string;
  name: string;
  type: "postgresql" | "mysql" | "salesforce" | "google-analytics" | "csv" | "rest-api";
  status: SourceStatus;
  lastSync: string;
  recordCount: number;
  schema?: string;
  host?: string;
  database?: string;
}

export interface AnomalyEvent {
  id: string;
  metric: string;
  date: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: AnomalySeverity;
  description: string;
  layer: DataLayer;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  change: number;
  trend: "up" | "down" | "flat";
  layer: DataLayer;
  unit: string;
}

export interface ReportInsight {
  id: string;
  category: string;
  insight: string;
  impact: "positive" | "negative" | "neutral";
  metric?: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateTimeSeries(
  base: number,
  variance: number,
  trend: number,
  anomalyIndices: number[] = [],
  seed = 42
): TimeSeriesPoint[] {
  const rand = seededRandom(seed);
  return MONTHS.map((month, i) => {
    const trendValue = base + trend * i;
    const noise = (rand() - 0.5) * variance * 2;
    let value = Math.max(0, trendValue + noise);
    const isAnomaly = anomalyIndices.includes(i);
    if (isAnomaly) value = value * (rand() > 0.5 ? 1.4 : 0.6);
    return {
      date: `2024-${String(i + 1).padStart(2, "0")}`,
      value: Math.round(value * 100) / 100,
      isAnomaly,
    };
  });
}

export const mockTimeSeries = {
  revenue: generateTimeSeries(850000, 80000, 15000, [2, 7], 1),
  expenses: generateTimeSeries(620000, 50000, 8000, [4], 2),
  customers: generateTimeSeries(4200, 300, 120, [8], 3),
  churnRate: generateTimeSeries(3.2, 0.5, -0.1, [5], 4),
  nps: generateTimeSeries(42, 5, 0.8, [3, 9], 5),
  uptime: generateTimeSeries(99.2, 0.4, 0.02, [1], 6),
  ticketVolume: generateTimeSeries(890, 120, -10, [6], 7),
  headcount: generateTimeSeries(142, 5, 3, [], 8),
  employeeSatisfaction: generateTimeSeries(7.4, 0.6, 0.05, [10], 9),
  orderVolume: generateTimeSeries(3100, 400, 80, [2, 11], 10),
};

export const mockKPIs: KPI[] = [
  {
    id: "kpi-1",
    name: "Monthly Recurring Revenue",
    description: "Total predictable revenue generated monthly",
    formula: "SUM(subscription_revenue) + SUM(recurring_fees)",
    currentValue: 1042000,
    targetValue: 1000000,
    warningThreshold: 900000,
    criticalThreshold: 800000,
    unit: "currency",
    trend: 4.2,
    status: "on-track",
    dataSource: "PostgreSQL",
    layer: "financial",
    history: mockTimeSeries.revenue,
  },
  {
    id: "kpi-2",
    name: "Customer Churn Rate",
    description: "Percentage of customers lost per month",
    formula: "(customers_lost / total_customers) * 100",
    currentValue: 2.8,
    targetValue: 3.0,
    warningThreshold: 4.0,
    criticalThreshold: 6.0,
    unit: "percentage",
    trend: -0.4,
    status: "on-track",
    dataSource: "Salesforce",
    layer: "customer",
    history: mockTimeSeries.churnRate,
  },
  {
    id: "kpi-3",
    name: "Net Promoter Score",
    description: "Customer loyalty and satisfaction metric",
    formula: "(%Promoters - %Detractors)",
    currentValue: 48,
    targetValue: 50,
    warningThreshold: 35,
    criticalThreshold: 20,
    unit: "score",
    trend: -2.0,
    status: "warning",
    dataSource: "Salesforce",
    layer: "customer",
    history: mockTimeSeries.nps,
  },
  {
    id: "kpi-4",
    name: "System Uptime",
    description: "Percentage of time system is operational",
    formula: "(uptime_minutes / total_minutes) * 100",
    currentValue: 99.7,
    targetValue: 99.9,
    warningThreshold: 99.5,
    criticalThreshold: 98.0,
    unit: "percentage",
    trend: 0.1,
    status: "warning",
    dataSource: "PostgreSQL",
    layer: "operations",
    history: mockTimeSeries.uptime,
  },
  {
    id: "kpi-5",
    name: "Employee Satisfaction Index",
    description: "Average employee satisfaction score",
    formula: "AVG(survey_score) out of 10",
    currentValue: 7.8,
    targetValue: 8.0,
    warningThreshold: 6.5,
    criticalThreshold: 5.0,
    unit: "score",
    trend: 0.3,
    status: "on-track",
    dataSource: "CSV Upload",
    layer: "hr",
    history: mockTimeSeries.employeeSatisfaction,
  },
  {
    id: "kpi-6",
    name: "Support Ticket Resolution Time",
    description: "Average hours to resolve a support ticket",
    formula: "AVG(resolution_time_hours)",
    currentValue: 18.4,
    targetValue: 24.0,
    warningThreshold: 36.0,
    criticalThreshold: 48.0,
    unit: "hours",
    trend: -2.1,
    status: "on-track",
    dataSource: "REST API",
    layer: "operations",
    history: mockTimeSeries.ticketVolume.map((p) => ({
      ...p,
      value: Math.round(p.value / 50),
    })),
  },
  {
    id: "kpi-7",
    name: "Gross Profit Margin",
    description: "Revenue minus COGS as a percentage of revenue",
    formula: "((revenue - COGS) / revenue) * 100",
    currentValue: 62.4,
    targetValue: 65.0,
    warningThreshold: 55.0,
    criticalThreshold: 45.0,
    unit: "percentage",
    trend: -1.2,
    status: "warning",
    dataSource: "PostgreSQL",
    layer: "financial",
    history: generateTimeSeries(63, 3, -0.08, [3, 8], 11),
  },
  {
    id: "kpi-8",
    name: "Customer Acquisition Cost",
    description: "Average cost to acquire a new customer",
    formula: "total_sales_marketing_spend / new_customers",
    currentValue: 284,
    targetValue: 250,
    warningThreshold: 350,
    criticalThreshold: 500,
    unit: "currency",
    trend: 12.0,
    status: "critical",
    dataSource: "Google Analytics",
    layer: "customer",
    history: generateTimeSeries(240, 30, 4, [5, 10], 12),
  },
];

export const mockDataSources: DataSource[] = [
  {
    id: "ds-1",
    name: "Primary PostgreSQL",
    type: "postgresql",
    status: "connected",
    lastSync: "2024-12-01T08:30:00Z",
    recordCount: 2847392,
    host: "db.internal.strata.io",
    database: "strata_prod",
    schema: "public",
  },
  {
    id: "ds-2",
    name: "Salesforce CRM",
    type: "salesforce",
    status: "connected",
    lastSync: "2024-12-01T08:00:00Z",
    recordCount: 184729,
    host: "company.salesforce.com",
  },
  {
    id: "ds-3",
    name: "Google Analytics 4",
    type: "google-analytics",
    status: "syncing",
    lastSync: "2024-12-01T07:45:00Z",
    recordCount: 4920183,
  },
  {
    id: "ds-4",
    name: "CSV Data Import",
    type: "csv",
    status: "connected",
    lastSync: "2024-11-28T14:20:00Z",
    recordCount: 8430,
  },
  {
    id: "ds-5",
    name: "Internal REST API",
    type: "rest-api",
    status: "connected",
    lastSync: "2024-12-01T08:25:00Z",
    recordCount: 392847,
    host: "api.internal.strata.io",
  },
  {
    id: "ds-6",
    name: "MySQL Analytics DB",
    type: "mysql",
    status: "disconnected",
    lastSync: "2024-11-30T22:10:00Z",
    recordCount: 1204839,
    host: "analytics-db.internal.strata.io",
    database: "analytics",
  },
];

export const mockAnomalies: AnomalyEvent[] = [
  {
    id: "ano-1",
    metric: "Monthly Revenue",
    date: "2024-03-01",
    value: 1190000,
    expectedValue: 880000,
    deviation: 35.2,
    severity: "high",
    description: "Revenue spike likely due to Q1 enterprise contract renewals",
    layer: "financial",
  },
  {
    id: "ano-2",
    metric: "System Uptime",
    date: "2024-02-01",
    value: 97.1,
    expectedValue: 99.3,
    deviation: -2.2,
    severity: "high",
    description: "Unexpected downtime from database migration issue",
    layer: "operations",
  },
  {
    id: "ano-3",
    metric: "Customer Churn Rate",
    date: "2024-06-01",
    value: 5.8,
    expectedValue: 3.1,
    deviation: 87.1,
    severity: "high",
    description: "Elevated churn following pricing plan changes in May",
    layer: "customer",
  },
  {
    id: "ano-4",
    metric: "Net Promoter Score",
    date: "2024-04-01",
    value: 31,
    expectedValue: 43,
    deviation: -27.9,
    severity: "medium",
    description: "NPS drop after support queue delays in March",
    layer: "customer",
  },
  {
    id: "ano-5",
    metric: "Support Ticket Volume",
    date: "2024-07-01",
    value: 1342,
    expectedValue: 870,
    deviation: 54.3,
    severity: "medium",
    description: "Ticket surge after product v3.0 release",
    layer: "operations",
  },
  {
    id: "ano-6",
    metric: "Employee Satisfaction",
    date: "2024-11-01",
    value: 5.9,
    expectedValue: 7.5,
    deviation: -21.3,
    severity: "medium",
    description: "Satisfaction dip following restructuring announcements",
    layer: "hr",
  },
  {
    id: "ano-7",
    metric: "Customer Acquisition Cost",
    date: "2024-06-01",
    value: 412,
    expectedValue: 265,
    deviation: 55.5,
    severity: "medium",
    description: "CAC increase during aggressive market expansion push",
    layer: "customer",
  },
  {
    id: "ano-8",
    metric: "Monthly Revenue",
    date: "2024-08-01",
    value: 718000,
    expectedValue: 940000,
    deviation: -23.6,
    severity: "high",
    description: "Revenue dip from summer seasonal slowdown and key account churn",
    layer: "financial",
  },
];

export const mockDashboardMetrics: Record<DataLayer, DashboardMetric[]> = {
  financial: [
    {
      id: "m1", label: "Annual Revenue", value: "$11.2M", rawValue: 11200000,
      change: 18.4, trend: "up", layer: "financial", unit: "currency",
    },
    {
      id: "m2", label: "Gross Profit Margin", value: "62.4%", rawValue: 62.4,
      change: -1.2, trend: "down", layer: "financial", unit: "percentage",
    },
    {
      id: "m3", label: "Operating Expenses", value: "$7.4M", rawValue: 7400000,
      change: 8.1, trend: "up", layer: "financial", unit: "currency",
    },
    {
      id: "m4", label: "EBITDA", value: "$2.8M", rawValue: 2800000,
      change: 22.3, trend: "up", layer: "financial", unit: "currency",
    },
  ],
  operations: [
    {
      id: "m5", label: "System Uptime", value: "99.7%", rawValue: 99.7,
      change: 0.1, trend: "up", layer: "operations", unit: "percentage",
    },
    {
      id: "m6", label: "Avg Resolution Time", value: "18.4h", rawValue: 18.4,
      change: -2.1, trend: "down", layer: "operations", unit: "hours",
    },
    {
      id: "m7", label: "Active Deployments", value: "47", rawValue: 47,
      change: 15.0, trend: "up", layer: "operations", unit: "count",
    },
    {
      id: "m8", label: "Error Rate", value: "0.08%", rawValue: 0.08,
      change: -0.03, trend: "down", layer: "operations", unit: "percentage",
    },
  ],
  customer: [
    {
      id: "m9", label: "Total Customers", value: "5,284", rawValue: 5284,
      change: 12.8, trend: "up", layer: "customer", unit: "count",
    },
    {
      id: "m10", label: "Churn Rate", value: "2.8%", rawValue: 2.8,
      change: -0.4, trend: "down", layer: "customer", unit: "percentage",
    },
    {
      id: "m11", label: "Net Promoter Score", value: "48", rawValue: 48,
      change: -2.0, trend: "down", layer: "customer", unit: "score",
    },
    {
      id: "m12", label: "Avg Contract Value", value: "$12,400", rawValue: 12400,
      change: 6.2, trend: "up", layer: "customer", unit: "currency",
    },
  ],
  hr: [
    {
      id: "m13", label: "Total Headcount", value: "178", rawValue: 178,
      change: 8.5, trend: "up", layer: "hr", unit: "count",
    },
    {
      id: "m14", label: "Employee Satisfaction", value: "7.8/10", rawValue: 7.8,
      change: 0.3, trend: "up", layer: "hr", unit: "score",
    },
    {
      id: "m15", label: "Attrition Rate", value: "11.2%", rawValue: 11.2,
      change: -1.8, trend: "down", layer: "hr", unit: "percentage",
    },
    {
      id: "m16", label: "Open Positions", value: "23", rawValue: 23,
      change: 28.0, trend: "up", layer: "hr", unit: "count",
    },
  ],
};

export const mockReportInsights: ReportInsight[] = [
  {
    id: "ins-1",
    category: "Financial Performance",
    insight: "Annual revenue has grown 18.4% YoY, exceeding the 15% target. Q4 performance is particularly strong with MRR at $1.04M, 4.2% above target.",
    impact: "positive",
    metric: "Revenue",
  },
  {
    id: "ins-2",
    category: "Customer Health",
    insight: "Churn rate improved to 2.8%, below the 3% target. However, NPS declined 2 points to 48, approaching the warning threshold of 35.",
    impact: "neutral",
    metric: "Customer Retention",
  },
  {
    id: "ins-3",
    category: "Customer Acquisition",
    insight: "Customer Acquisition Cost has risen to $284, exceeding the $250 target by 13.6%. Marketing spend efficiency needs review.",
    impact: "negative",
    metric: "CAC",
  },
  {
    id: "ins-4",
    category: "Operational Efficiency",
    insight: "System uptime at 99.7% is slightly below the 99.9% SLA target. The February incident cost 3.2 hours of downtime and requires post-mortem action items.",
    impact: "neutral",
    metric: "Uptime",
  },
  {
    id: "ins-5",
    category: "Profitability",
    insight: "Gross profit margin declined 1.2pp to 62.4% due to increased COGS from infrastructure scaling. Cost optimization initiatives are recommended.",
    impact: "negative",
    metric: "Gross Margin",
  },
  {
    id: "ins-6",
    category: "Team & Culture",
    insight: "Employee satisfaction index improved to 7.8/10, driven by Q3 compensation adjustments. Attrition fell to 11.2%, saving approximately $340K in recruiting costs.",
    impact: "positive",
    metric: "Employee Satisfaction",
  },
];

export const multiSeriesData = MONTHS.map((month, i) => ({
  date: `2024-${String(i + 1).padStart(2, "0")}`,
  month,
  revenue: mockTimeSeries.revenue[i].value,
  expenses: mockTimeSeries.expenses[i].value,
  customers: mockTimeSeries.customers[i].value,
  churnRate: mockTimeSeries.churnRate[i].value,
  nps: mockTimeSeries.nps[i].value,
  uptime: mockTimeSeries.uptime[i].value,
  revenueAnomaly: mockTimeSeries.revenue[i].isAnomaly,
  expensesAnomaly: mockTimeSeries.expenses[i].isAnomaly,
}));

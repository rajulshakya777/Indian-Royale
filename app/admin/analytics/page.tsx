"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface ChartPoint {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

interface AnalyticsResponse {
  weekly: ChartPoint[];
  monthly: ChartPoint[];
  yearly: ChartPoint[];
  totals: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
  };
}

type ViewMode = "week" | "month" | "year";

function SalesChart({
  title,
  points,
}: {
  title: string;
  points: ChartPoint[];
}) {
  const maxRevenue = Math.max(...points.map((p) => p.revenue), 0);

  return (
    <div className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-[#D4A843] mb-6">{title}</h2>

      {points.length === 0 ? (
        <div className="text-[#FFF8E7]/50 text-sm">No data available.</div>
      ) : (
        <>
          <div className="h-64 flex items-end gap-2">
            {points.map((point) => {
              const heightPct = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={point.key} className="flex-1 min-w-0 flex flex-col items-center">
                  <div className="w-full flex justify-center mb-2">
                    <span className="text-[10px] text-[#FFF8E7]/55">
                      {formatCurrency(point.revenue)}
                    </span>
                  </div>
                  <div
                    title={`${point.label}: ${formatCurrency(point.revenue)} (${point.orders} orders)`}
                    className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-[#D4A843] to-[#f2d78b] hover:brightness-110 transition-all"
                    style={{ height: `${Math.max(heightPct, point.revenue > 0 ? 6 : 0)}%` }}
                  />
                  <span className="mt-2 text-[10px] text-[#FFF8E7]/70 text-center truncate w-full">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 text-xs text-[#FFF8E7]/55">
            Total: {formatCurrency(points.reduce((sum, p) => sum + p.revenue, 0))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [data, setData] = useState<AnalyticsResponse>({
    weekly: [],
    monthly: [],
    yearly: [],
    totals: { revenue: 0, orders: 0, averageOrderValue: 0 },
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setError("Admin session missing. Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to load analytics");
      }

      setData(result.data);

      const years = result.data.yearly
        .map((p: ChartPoint) => p.key)
        .sort((a: string, b: string) => b.localeCompare(a));
      if (years.length) {
        setSelectedYear(years[0]);
      }
      const months = result.data.monthly
        .map((p: ChartPoint) => p.key)
        .sort((a: string, b: string) => b.localeCompare(a));
      if (months.length) {
        setSelectedMonth(months[0].slice(5, 7));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load analytics";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#D4A843] text-lg">Loading analytics...</div>
      </div>
    );
  }

  const availableYears = data.yearly
    .map((p) => p.key)
    .sort((a, b) => b.localeCompare(a));

  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const monthlyForYear = selectedYear
    ? data.monthly.filter((p) => p.key.startsWith(`${selectedYear}-`))
    : data.monthly;

  const weeklyForMonth =
    selectedYear && selectedMonth
      ? data.weekly.filter((p) => {
          const d = new Date(`${p.key}T00:00:00Z`);
          const y = String(d.getUTCFullYear());
          const m = String(d.getUTCMonth() + 1).padStart(2, "0");
          return y === selectedYear && m === selectedMonth;
        })
      : data.weekly;

  const filteredWeekly =
    selectedWeek === "all"
      ? weeklyForMonth
      : weeklyForMonth.filter((p) => p.key === selectedWeek);

  const chartPoints =
    viewMode === "year"
      ? data.yearly
      : viewMode === "month"
      ? monthlyForYear
      : filteredWeekly;

  const chartTitle =
    viewMode === "year"
      ? "Yearly Sales"
      : viewMode === "month"
      ? `Monthly Sales${selectedYear ? ` - ${selectedYear}` : ""}`
      : `Weekly Sales${selectedYear && selectedMonth ? ` - ${selectedYear}-${selectedMonth}` : ""}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4A843]">Analytics</h1>
        <p className="text-[#FFF8E7]/60 mt-1">
          Select week, month, or year to visualize sales trends.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-[#D4A843]/20 rounded-xl p-6">
          <div className="text-[#FFF8E7]/60 text-sm">Total Sales</div>
          <div className="text-2xl font-bold text-green-300 mt-1">
            {formatCurrency(data.totals.revenue)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-[#D4A843]/20 rounded-xl p-6">
          <div className="text-[#FFF8E7]/60 text-sm">Total Paid Orders</div>
          <div className="text-2xl font-bold text-blue-300 mt-1">
            {data.totals.orders}
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#D4A843]/20 to-[#D4A843]/5 border border-[#D4A843]/20 rounded-xl p-6">
          <div className="text-[#FFF8E7]/60 text-sm">Average Order Value</div>
          <div className="text-2xl font-bold text-[#D4A843] mt-1">
            {formatCurrency(data.totals.averageOrderValue)}
          </div>
        </div>
      </div>

      <div className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl p-4 flex flex-col md:flex-row md:items-end gap-3">
        <div>
          <label className="block text-[#FFF8E7]/70 text-xs mb-1">View</label>
          <select
            value={viewMode}
            onChange={(e) => {
              setViewMode(e.target.value as ViewMode);
              setSelectedWeek("all");
            }}
            className="px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        {(viewMode === "week" || viewMode === "month") && (
          <div>
            <label className="block text-[#FFF8E7]/70 text-xs mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedWeek("all");
              }}
              className="px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {viewMode === "week" && (
          <div>
            <label className="block text-[#FFF8E7]/70 text-xs mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedWeek("all");
              }}
              className="px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {viewMode === "week" && (
          <div>
            <label className="block text-[#FFF8E7]/70 text-xs mb-1">Week</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
            >
              <option value="all">All Weeks</option>
              {weeklyForMonth.map((w) => (
                <option key={w.key} value={w.key}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SalesChart title={chartTitle} points={chartPoints} />
      </div>
    </div>
  );
}

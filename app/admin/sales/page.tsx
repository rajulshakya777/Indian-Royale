"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DailyBreakdown {
  date: string;
  orders: number;
  revenue: number;
  refunds: number;
}

export default function AdminSalesPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdown[]>([]);

  useEffect(() => {
    // Default to this month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(now.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesData();
    }
  }, [startDate, endDate]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // Fetch delivered orders in date range with subscription data
      const { data: orders, error } = await supabase
        .from("subscription_orders")
        .select("*, subscription:subscriptions(total_amount, num_weeks, selected_days)")
        .gte("delivery_date", startDate)
        .lte("delivery_date", endDate)
        .order("delivery_date", { ascending: true });

      if (error) throw error;

      // Fetch refunds in date range
      const { data: refunds } = await supabase
        .from("cancellation_requests")
        .select("total_refund_amount, created_at")
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59`);

      const allOrders = orders || [];
      const allRefunds = refunds || [];

      // Calculate per-order revenue: total_amount / (num_weeks * selected_days.length)
      let revenue = 0;
      const dailyMap: Record<string, DailyBreakdown> = {};

      allOrders.forEach((order: any) => {
        const date = order.delivery_date;
        const sub = order.subscription;
        let orderRevenue = 0;

        if (sub && sub.total_amount && sub.num_weeks && sub.selected_days?.length) {
          orderRevenue =
            sub.total_amount / (sub.num_weeks * sub.selected_days.length);
        }

        if (order.status === "delivered") {
          revenue += orderRevenue;
        }

        if (!dailyMap[date]) {
          dailyMap[date] = { date, orders: 0, revenue: 0, refunds: 0 };
        }
        dailyMap[date].orders += 1;
        if (order.status === "delivered") {
          dailyMap[date].revenue += orderRevenue;
        }
      });

      let refundTotal = 0;
      allRefunds.forEach((r: any) => {
        refundTotal += r.total_refund_amount || 0;
        const date = r.created_at?.split("T")[0];
        if (date && dailyMap[date]) {
          dailyMap[date].refunds += r.total_refund_amount || 0;
        } else if (date) {
          dailyMap[date] = {
            date,
            orders: 0,
            revenue: 0,
            refunds: r.total_refund_amount || 0,
          };
        }
      });

      setTotalRevenue(revenue);
      setTotalOrders(allOrders.length);
      setTotalRefunds(refundTotal);

      const breakdown = Object.values(dailyMap).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      setDailyBreakdown(breakdown);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setQuickFilter = (type: string) => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (type) {
      case "this_week": {
        const dayOfWeek = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        break;
      }
      case "this_month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "all_time":
        start = new Date(2020, 0, 1);
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const netRevenue = totalRevenue - totalRefunds;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4A843]">Sales Report</h1>
        <p className="text-[#FFF8E7]/60 mt-1">
          View revenue, orders, and refund data.
        </p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div>
          <label className="block text-[#FFF8E7]/70 text-sm mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
          />
        </div>
        <div>
          <label className="block text-[#FFF8E7]/70 text-sm mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "this_week", label: "This Week" },
            { key: "this_month", label: "This Month" },
            { key: "last_month", label: "Last Month" },
            { key: "all_time", label: "All Time" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setQuickFilter(filter.key)}
              className="px-4 py-2 rounded-lg border border-[#D4A843]/30 text-[#D4A843] text-sm hover:bg-[#D4A843]/10 transition-colors"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="text-[#D4A843] text-center py-8">
          Loading sales data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-[#D4A843]/20 rounded-xl p-6">
              <div className="text-[#FFF8E7]/60 text-sm">Total Revenue</div>
              <div className="text-2xl font-bold text-green-300 mt-1">
                {formatCurrency(totalRevenue)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-[#D4A843]/20 rounded-xl p-6">
              <div className="text-[#FFF8E7]/60 text-sm">Total Orders</div>
              <div className="text-2xl font-bold text-blue-300 mt-1">
                {totalOrders}
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-[#D4A843]/20 rounded-xl p-6">
              <div className="text-[#FFF8E7]/60 text-sm">Total Refunds</div>
              <div className="text-2xl font-bold text-red-300 mt-1">
                {formatCurrency(totalRefunds)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#D4A843]/20 to-[#D4A843]/5 border border-[#D4A843]/20 rounded-xl p-6">
              <div className="text-[#FFF8E7]/60 text-sm">Net Revenue</div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  netRevenue >= 0 ? "text-[#D4A843]" : "text-red-300"
                }`}
              >
                {formatCurrency(netRevenue)}
              </div>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          <div>
            <h2 className="text-xl font-semibold text-[#D4A843] mb-4">
              Daily Breakdown
            </h2>
            <div className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#D4A843]/20">
                      <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                        Date
                      </th>
                      <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                        Orders
                      </th>
                      <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                        Revenue
                      </th>
                      <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                        Refunds
                      </th>
                      <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                        Net
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyBreakdown.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-[#FFF8E7]/50"
                        >
                          No data for the selected period.
                        </td>
                      </tr>
                    ) : (
                      dailyBreakdown.map((day) => (
                        <tr
                          key={day.date}
                          className="border-b border-[#D4A843]/10 hover:bg-[#D4A843]/5"
                        >
                          <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm">
                            {formatDate(day.date)}
                          </td>
                          <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm">
                            {day.orders}
                          </td>
                          <td className="px-6 py-4 text-green-300 text-sm">
                            {formatCurrency(day.revenue)}
                          </td>
                          <td className="px-6 py-4 text-red-300 text-sm">
                            {formatCurrency(day.refunds)}
                          </td>
                          <td className="px-6 py-4 text-[#D4A843] text-sm font-medium">
                            {formatCurrency(day.revenue - day.refunds)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

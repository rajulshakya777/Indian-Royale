"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Stats {
  todayOrders: number;
  activeSubscriptions: number;
  totalDelivered: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  delivery_date: string;
  day: string;
  meal_type: string;
  status: string;
  subscription: {
    customer_name: string;
    customer_email: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    activeSubscriptions: 0,
    totalDelivered: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Today's orders
      const { count: todayOrders } = await supabase
        .from("subscription_orders")
        .select("*", { count: "exact", head: true })
        .gte("delivery_date", `${today}T00:00:00`)
        .lt("delivery_date", `${today}T23:59:59`)
        .eq("status", "upcoming");

      // Active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Total delivered
      const { count: totalDelivered } = await supabase
        .from("subscription_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "delivered");

      // Total revenue
      const { data: revenueData } = await supabase
        .from("subscriptions")
        .select("total_amount")
        .in("status", ["active", "completed"]);

      const totalRevenue =
        revenueData?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;

      setStats({
        todayOrders: todayOrders || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalDelivered: totalDelivered || 0,
        totalRevenue,
      });

      // Recent orders
      const { data: orders } = await supabase
        .from("subscription_orders")
        .select("id, delivery_date, day, meal_type, status, subscription:subscriptions(customer_name, customer_email)")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentOrders((orders as unknown as RecentOrder[]) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Today's Orders",
      value: stats.todayOrders,
      icon: "\u{1F4E6}",
      color: "from-[#D4A843]/20 to-[#D4A843]/5",
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: "\u{1F504}",
      color: "from-green-500/20 to-green-500/5",
    },
    {
      label: "Total Delivered",
      value: stats.totalDelivered,
      icon: "\u2705",
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: "\u{1F4B0}",
      color: "from-[#800020]/30 to-[#800020]/10",
    },
  ];

  const quickLinks = [
    { href: "/admin/menu", label: "Manage Menu", icon: "\u{1F372}" },
    { href: "/admin/orders", label: "View Orders", icon: "\u{1F4CB}" },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: "\u{1F4E6}" },
    { href: "/admin/sales", label: "Sales Report", icon: "\u{1F4B0}" },
    { href: "/admin/analytics", label: "Analytics", icon: "\u{1F4C8}" },
    { href: "/admin/export", label: "Export Data", icon: "\u{1F4E5}" },
    { href: "/admin/content", label: "Edit Content", icon: "\u{1F4DD}" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#D4A843] text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4A843]">Dashboard</h1>
        <p className="text-[#FFF8E7]/60 mt-1">
          Welcome back. Here is your overview for today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border border-[#D4A843]/20 rounded-xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{card.icon}</span>
            </div>
            <div className="text-2xl font-bold text-[#FFF8E7]">
              {card.value}
            </div>
            <div className="text-[#FFF8E7]/60 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-[#D4A843] mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#D4A843]/20 bg-[#800020]/10 hover:bg-[#800020]/20 transition-colors text-center"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-[#FFF8E7]/80 text-sm">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-xl font-semibold text-[#D4A843] mb-4">
          Recent Orders
        </h2>
        <div className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D4A843]/20">
                  <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                    Order ID
                  </th>
                  <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                    Day
                  </th>
                  <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                    Delivery Date
                  </th>
                  <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-[#FFF8E7]/50"
                    >
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#D4A843]/10 hover:bg-[#D4A843]/5"
                    >
                      <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm font-mono">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7] text-sm">
                        {order.subscription?.customer_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm">
                        {order.day}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm">
                        {formatDate(order.delivery_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === "delivered"
                              ? "bg-green-900/40 text-green-300"
                              : order.status === "upcoming"
                              ? "bg-blue-900/40 text-blue-300"
                              : order.status === "cancelled"
                              ? "bg-red-900/40 text-red-300"
                              : "bg-gray-900/40 text-gray-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

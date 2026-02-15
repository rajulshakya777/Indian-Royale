"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Subscription {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  selected_days: string[];
  num_weeks: number;
  total_amount: number;
  status: string;
  created_at: string;
  subscription_orders?: SubscriptionOrder[];
}

interface SubscriptionOrder {
  id: string;
  day: string;
  meal_type: string;
  delivery_date: string;
  status: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, subscription_orders(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = subscriptions.filter((sub) => {
    const matchesFilter = filter === "all" || sub.status === filter;
    const matchesSearch =
      !search ||
      sub.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      sub.order_id?.toLowerCase().includes(search.toLowerCase()) ||
      sub.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusFilters = ["all", "active", "completed", "cancelled"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#D4A843] text-lg">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4A843]">Subscriptions</h1>
        <p className="text-[#FFF8E7]/60 mt-1">
          View and manage all customer subscriptions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === s
                  ? "bg-[#D4A843] text-[#1a0a00]"
                  : "border border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by email, order ID, or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] placeholder-[#FFF8E7]/40 text-sm focus:outline-none focus:border-[#D4A843]"
        />
      </div>

      {/* Table */}
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
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium hidden lg:table-cell">
                  Phone
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Days
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Weeks
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Total
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium hidden lg:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-[#FFF8E7]/50"
                  >
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <>
                    <tr
                      key={sub.id}
                      onClick={() =>
                        setExpandedId(expandedId === sub.id ? null : sub.id)
                      }
                      className="border-b border-[#D4A843]/10 hover:bg-[#D4A843]/5 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm font-mono">
                        {sub.order_id || sub.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7] text-sm">
                        {sub.customer_name}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/70 text-sm hidden md:table-cell">
                        {sub.customer_email}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/70 text-sm hidden lg:table-cell">
                        {sub.customer_phone}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm">
                        {sub.selected_days?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm">
                        {sub.num_weeks}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7] text-sm font-medium">
                        {formatCurrency(sub.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            sub.status === "active"
                              ? "bg-green-900/40 text-green-300"
                              : sub.status === "completed"
                              ? "bg-blue-900/40 text-blue-300"
                              : sub.status === "cancelled"
                              ? "bg-red-900/40 text-red-300"
                              : "bg-gray-900/40 text-gray-300"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/70 text-sm hidden lg:table-cell">
                        {formatDate(sub.created_at)}
                      </td>
                    </tr>

                    {/* Expanded details */}
                    {expandedId === sub.id && sub.subscription_orders && (
                      <tr key={`${sub.id}-details`}>
                        <td colSpan={9} className="px-6 py-4 bg-[#1a0a00]/40">
                          <div className="text-[#D4A843] text-sm font-medium mb-3">
                            Order Details ({sub.subscription_orders.length}{" "}
                            orders)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {sub.subscription_orders.map((order) => (
                              <div
                                key={order.id}
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#800020]/10 border border-[#D4A843]/10"
                              >
                                <div className="text-[#FFF8E7]/80 text-xs">
                                  <span className="font-medium">
                                    {order.day}
                                  </span>{" "}
                                  - {formatDate(order.delivery_date)}
                                </div>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
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
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[#FFF8E7]/40 text-sm">
        Showing {filtered.length} of {subscriptions.length} subscriptions
      </div>
    </div>
  );
}

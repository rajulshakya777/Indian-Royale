"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface Order {
  id: string;
  subscription_id: string;
  day: string;
  meal_type: string;
  delivery_date: string;
  status: string;
  created_at: string;
  subscription: {
    customer_name: string;
    customer_email: string;
    order_id: string;
  };
}

type Tab = "today" | "upcoming" | "delivered" | "cancelled";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [markingDelivered, setMarkingDelivered] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_orders")
        .select("*, subscription:subscriptions(customer_name, customer_email, order_id)")
        .order("delivery_date", { ascending: true });

      if (error) throw error;
      setOrders((data as unknown as Order[]) || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const filteredOrders = orders.filter((order) => {
    switch (activeTab) {
      case "today":
        return order.delivery_date.startsWith(today);
      case "upcoming":
        return order.delivery_date > `${today}T23:59:59` && order.status === "upcoming";
      case "delivered":
        return order.status === "delivered";
      case "cancelled":
        return order.status === "cancelled";
      default:
        return true;
    }
  });

  const handleMarkDelivered = async (orderId: string) => {
    setMarkingDelivered((prev) => ({ ...prev, [orderId]: true }));
    try {
      const { error } = await supabase
        .from("subscription_orders")
        .update({ status: "delivered" })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "delivered" } : o))
      );
    } catch (error) {
      console.error("Error marking as delivered:", error);
      alert("Failed to update order status.");
    } finally {
      setMarkingDelivered((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    {
      key: "today",
      label: "Today",
      count: orders.filter((o) => o.delivery_date === today).length,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: orders.filter(
        (o) => o.delivery_date > `${today}T23:59:59` && o.status === "upcoming"
      ).length,
    },
    {
      key: "delivered",
      label: "Delivered",
      count: orders.filter((o) => o.status === "delivered").length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#D4A843] text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4A843]">Orders</h1>
        <p className="text-[#FFF8E7]/60 mt-1">
          Manage delivery orders and update statuses.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-[#D4A843] text-[#1a0a00]"
                : "border border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10"
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key
                  ? "bg-[#1a0a00]/20 text-[#1a0a00]"
                  : "bg-[#D4A843]/20 text-[#D4A843]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
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
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium hidden md:table-cell">
                  Meal Type
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Delivery Date
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-[#FFF8E7]/50"
                  >
                    No orders found for this tab.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#D4A843]/10 hover:bg-[#D4A843]/5"
                  >
                    <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm font-mono">
                      {order.subscription?.order_id || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-[#FFF8E7] text-sm">
                      {order.subscription?.customer_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm">
                      {order.day}
                    </td>
                    <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm hidden md:table-cell">
                      {order.meal_type || "Standard"}
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
                    <td className="px-6 py-4">
                      {order.status === "upcoming" && (
                        <button
                          onClick={() => handleMarkDelivered(order.id)}
                          disabled={markingDelivered[order.id]}
                          className="px-4 py-1.5 rounded-lg bg-green-700 text-white text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {markingDelivered[order.id]
                            ? "Updating..."
                            : "Mark Delivered"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[#FFF8E7]/40 text-sm">
        Showing {filteredOrders.length} orders
      </div>
    </div>
  );
}

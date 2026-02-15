"use client";

import { Fragment, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CancellationRequest {
  id: string;
  subscription_id: string;
  order_id: string;
  cancelled_order_ids: string[];
  total_refund_amount: number;
  refund_eligible_count: number;
  no_refund_count: number;
  status: string;
  reason: string;
  created_at: string;
  subscription: {
    customer_name: string;
    customer_email: string;
    order_id: string;
  };
}

export default function AdminCancellationsPage() {
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCancellations();
  }, []);

  const fetchCancellations = async () => {
    try {
      const { data, error } = await supabase
        .from("cancellation_requests")
        .select(
          "*, subscription:subscriptions(customer_name, customer_email, order_id)"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCancellations((data as unknown as CancellationRequest[]) || []);
    } catch (error) {
      console.error("Error fetching cancellations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#D4A843] text-lg">Loading cancellations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4A843]">Cancellations</h1>
        <p className="text-[#FFF8E7]/60 mt-1">
          View all cancellation requests and refund details.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl p-5">
          <div className="text-[#FFF8E7]/60 text-sm">Total Cancellations</div>
          <div className="text-2xl font-bold text-[#FFF8E7] mt-1">
            {cancellations.length}
          </div>
        </div>
        <div className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl p-5">
          <div className="text-[#FFF8E7]/60 text-sm">Total Refund Amount</div>
          <div className="text-2xl font-bold text-[#FFF8E7] mt-1">
            {formatCurrency(
              cancellations.reduce(
                (sum, c) => sum + (c.total_refund_amount || 0),
                0
              )
            )}
          </div>
        </div>
        <div className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl p-5">
          <div className="text-[#FFF8E7]/60 text-sm">
            Total Cancelled Orders
          </div>
          <div className="text-2xl font-bold text-[#FFF8E7] mt-1">
            {cancellations.reduce(
              (sum, c) => sum + (c.cancelled_order_ids?.length || 0),
              0
            )}
          </div>
        </div>
      </div>

      {/* Cancellations Table */}
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
                  Cancelled Orders
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Refund Amount
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium hidden md:table-cell">
                  No-Refund Count
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-[#D4A843] text-sm font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {cancellations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-[#FFF8E7]/50"
                  >
                    No cancellation requests found.
                  </td>
                </tr>
              ) : (
                cancellations.map((cancellation) => (
                  <Fragment key={cancellation.id}>
                    <tr
                      onClick={() =>
                        setExpandedId(
                          expandedId === cancellation.id
                            ? null
                            : cancellation.id
                        )
                      }
                      className="border-b border-[#D4A843]/10 hover:bg-[#D4A843]/5 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm font-mono">
                        {cancellation.subscription?.order_id ||
                          cancellation.order_id ||
                          cancellation.subscription_id?.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7] text-sm">
                        {cancellation.subscription?.customer_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm">
                        {cancellation.cancelled_order_ids?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7] text-sm font-medium">
                        {formatCurrency(cancellation.total_refund_amount || 0)}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/80 text-sm hidden md:table-cell">
                        {cancellation.no_refund_count || 0}
                      </td>
                      <td className="px-6 py-4 text-[#FFF8E7]/70 text-sm">
                        {formatDate(cancellation.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            cancellation.status === "processed"
                              ? "bg-green-900/40 text-green-300"
                            : cancellation.status === "pending"
                              ? "bg-yellow-900/40 text-yellow-300"
                            : cancellation.status === "failed"
                              ? "bg-red-900/40 text-red-300"
                              : "bg-gray-900/40 text-gray-300"
                          }`}
                        >
                          {cancellation.status}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded details */}
                    {expandedId === cancellation.id && (
                      <tr key={`${cancellation.id}-details`}>
                        <td colSpan={7} className="px-6 py-4 bg-[#1a0a00]/40">
                          <div className="space-y-3">
                            <div>
                              <span className="text-[#D4A843] text-sm font-medium">
                                Customer Email:
                              </span>
                              <span className="text-[#FFF8E7]/70 text-sm ml-2">
                                {cancellation.subscription?.customer_email ||
                                  "N/A"}
                              </span>
                            </div>
                            {cancellation.reason && (
                              <div>
                                <span className="text-[#D4A843] text-sm font-medium">
                                  Reason:
                                </span>
                                <span className="text-[#FFF8E7]/70 text-sm ml-2">
                                  {cancellation.reason}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-[#D4A843] text-sm font-medium">
                                Cancelled Order IDs:
                              </span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {cancellation.cancelled_order_ids?.map(
                                  (orderId) => (
                                    <span
                                      key={orderId}
                                      className="px-2 py-1 rounded bg-[#800020]/20 text-[#FFF8E7]/60 text-xs font-mono"
                                    >
                                      {orderId.slice(0, 8)}...
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

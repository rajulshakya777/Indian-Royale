"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
type OrderData = any;

export default function SubscribeSuccessWrapper() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#1a0a00] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
      </main>
    }>
      <SubscribeSuccessPageInner />
    </Suspense>
  );
}

function SubscribeSuccessPageInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError(true);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/track/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setOrder({
          orderId: data.subscription?.order_id || orderId,
          customer: {
            name: data.subscription?.customer_name || "",
            email: data.subscription?.customer_email || "",
            phone: data.subscription?.customer_phone || "",
            address: data.subscription?.customer_address || "",
          },
          selectedDays: data.subscription?.selected_days || [],
          weeks: data.subscription?.num_weeks || 0,
          totalPrice: data.subscription?.total_amount || 0,
          status: data.subscription?.status || "active",
          createdAt: data.subscription?.created_at || "",
          orders: data.orders || [],
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const deliveryDates: string[] = order?.orders
    ? order.orders.map((o: any) => {
        const d = new Date(o.delivery_date);
        return `${o.day} - ${o.meal_type === "lunch" ? "Lunch" : "Dinner"} - ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
      })
    : [];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1a0a00] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#FFF8E7]/60">Loading your order details...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#1a0a00] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#FFF8E7] mb-2">
            Order Not Found
          </h1>
          <p className="text-[#FFF8E7]/60 mb-6">
            We couldn&apos;t find the order details. The link may be invalid or
            expired.
          </p>
          <Link
            href="/subscribe"
            className="inline-block px-6 py-3 bg-[#D4A843] text-[#1a0a00] font-bold rounded-lg hover:bg-[#c49a3a] transition-colors"
          >
            Start a New Subscription
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a0a00] print:bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#800020] to-[#1a0a00] py-16 text-center print:bg-white print:py-8">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 print:bg-green-100">
          <svg
            className="w-10 h-10 text-green-400 print:text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#D4A843] mb-3 print:text-[#1a0a00]">
          Subscription Confirmed!
        </h1>
        <p className="text-[#FFF8E7]/70 text-lg print:text-gray-600">
          Thank you for your order, {order.customer.name}. Your meals are on the
          way!
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20 -mt-2">
        {/* Order Receipt */}
        <div className="bg-[#800020]/20 border border-[#D4A843]/20 rounded-2xl p-6 md:p-8 mb-6 print:bg-white print:border-gray-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#D4A843] print:text-[#1a0a00]">
              Order Receipt
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30 print:bg-green-100 print:text-green-700 print:border-green-300">
              {order.status === "paid" ? "Paid" : order.status}
            </span>
          </div>

          {/* Order ID */}
          <div className="bg-[#1a0a00]/50 rounded-lg p-4 mb-6 print:bg-gray-50">
            <p className="text-[#FFF8E7]/50 text-xs uppercase tracking-wider mb-1 print:text-gray-500">
              Order ID
            </p>
            <p className="text-[#D4A843] font-mono font-bold text-lg print:text-[#1a0a00]">
              {order.orderId}
            </p>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h3 className="text-[#D4A843] font-semibold text-sm uppercase tracking-wider mb-3 print:text-gray-700">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[#FFF8E7]/40 print:text-gray-500">
                  Name
                </span>
                <p className="text-[#FFF8E7] font-medium print:text-[#1a0a00]">
                  {order.customer.name}
                </p>
              </div>
              <div>
                <span className="text-[#FFF8E7]/40 print:text-gray-500">
                  Email
                </span>
                <p className="text-[#FFF8E7] font-medium print:text-[#1a0a00]">
                  {order.customer.email}
                </p>
              </div>
              <div>
                <span className="text-[#FFF8E7]/40 print:text-gray-500">
                  Phone
                </span>
                <p className="text-[#FFF8E7] font-medium print:text-[#1a0a00]">
                  {order.customer.phone}
                </p>
              </div>
              <div>
                <span className="text-[#FFF8E7]/40 print:text-gray-500">
                  Address
                </span>
                <p className="text-[#FFF8E7] font-medium print:text-[#1a0a00]">
                  {order.customer.address}
                </p>
              </div>
            </div>
          </div>

          {/* Selected Days & Meals */}
          <div className="mb-6">
            <h3 className="text-[#D4A843] font-semibold text-sm uppercase tracking-wider mb-3 print:text-gray-700">
              Weekly Schedule
            </h3>
            <div className="space-y-2">
              {order.selectedDays.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-[#FFF8E7]/5 last:border-0 print:border-gray-200"
                >
                  <span className="text-[#FFF8E7] font-medium print:text-[#1a0a00]">
                    {item.day}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#D4A843]/15 text-[#D4A843] print:bg-amber-100 print:text-amber-800">
                    {item.mealType === "lunch" ? "Lunch" : "Dinner"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-[#D4A843]/10 rounded-lg p-4 flex justify-between items-center print:bg-amber-50">
            <div>
              <p className="text-[#FFF8E7]/50 text-sm print:text-gray-500">
                {order.weeks} week{order.weeks !== 1 ? "s" : ""} &middot;{" "}
                {order.selectedDays.length * order.weeks}{" "}
                total meals
              </p>
            </div>
            <p className="text-[#D4A843] font-bold text-2xl print:text-[#1a0a00]">
              {formatCurrency(order.totalPrice)}
            </p>
          </div>
        </div>

        {/* Upcoming Delivery Dates */}
        {deliveryDates.length > 0 && (
          <div className="bg-[#800020]/20 border border-[#D4A843]/20 rounded-2xl p-6 md:p-8 mb-6 print:bg-white print:border-gray-300">
            <h2 className="text-xl font-bold text-[#D4A843] mb-4 print:text-[#1a0a00]">
              Upcoming Deliveries
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {deliveryDates.map((date, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#1a0a00]/30 print:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-[#D4A843]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#D4A843] text-xs font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-[#FFF8E7]/80 text-sm print:text-[#1a0a00]">
                    {date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 24-Hour Notice */}
        <div className="bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-xl p-4 mb-8 flex gap-3 print:bg-amber-50 print:border-amber-300">
          <svg
            className="w-6 h-6 text-[#D4A843] flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-[#D4A843] font-semibold text-sm">
              24-Hour Activation Notice
            </p>
            <p className="text-[#FFF8E7]/60 text-sm mt-1 print:text-gray-600">
              Your subscription will be activated 24 hours after purchase. Your
              first delivery will be scheduled accordingly.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <Link
            href={`/track?id=${order.orderId}`}
            className="flex-1 text-center px-6 py-3 bg-[#D4A843] text-[#1a0a00] font-bold rounded-lg hover:bg-[#c49a3a] transition-colors"
          >
            Track Your Order
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 px-6 py-3 border border-[#D4A843]/30 text-[#D4A843] font-medium rounded-lg hover:bg-[#D4A843]/10 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Receipt
          </button>
          <Link
            href="/"
            className="flex-1 text-center px-6 py-3 border border-[#FFF8E7]/15 text-[#FFF8E7]/60 font-medium rounded-lg hover:bg-[#FFF8E7]/5 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

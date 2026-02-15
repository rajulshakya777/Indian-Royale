'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, canCancelWithRefund, canCancelOrder, MEAL_PRICE } from '@/lib/utils';

interface Subscription {
  id: string;
  order_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  selected_days: string[];
  num_weeks: number;
  total_meals: number;
  total_amount: number;
  status: string;
}

interface SubscriptionOrder {
  id: string;
  subscription_id: string;
  order_id: string;
  delivery_date: string;
  day: string;
  meal_type: string;
  meal_price: number;
  status: 'upcoming' | 'delivered' | 'cancelled';
  refund_status: string | null;
  cancelled_at: string | null;
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancellingAll, setCancellingAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchOrder = async () => {
    if (!orderId.trim()) {
      setError('Please enter an Order ID.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setSubscription(null);
    setOrders([]);

    try {
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('order_id', orderId.trim())
        .single();

      if (subError || !subData) {
        setError('No subscription found with that Order ID. Please check and try again.');
        setLoading(false);
        return;
      }

      setSubscription(subData);

      const { data: ordersData, error: ordersError } = await supabase
        .from('subscription_orders')
        .select('*')
        .eq('order_id', orderId.trim())
        .order('delivery_date', { ascending: true });

      if (ordersError) {
        setError('Failed to fetch order details.');
        setLoading(false);
        return;
      }

      setOrders(ordersData || []);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (order: SubscriptionOrder) => {
    const withRefund = canCancelWithRefund(order.delivery_date);
    const confirmMsg = withRefund
      ? `Cancel this meal on ${formatDate(order.delivery_date)}? You will receive a refund of ${formatCurrency(MEAL_PRICE)}.`
      : `Cancel this meal on ${formatDate(order.delivery_date)}? No refund will be issued as the delivery is within 48 hours.`;

    if (!confirm(confirmMsg)) return;

    setCancellingId(order.id);
    setSuccessMessage('');

    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.order_id,
          orderIds: [order.id],
          cancelAll: false,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to cancel order.');
        return;
      }

      setSuccessMessage(
        withRefund
          ? `Meal on ${formatDate(order.delivery_date)} cancelled. Refund of ${formatCurrency(MEAL_PRICE)} will be processed.`
          : `Meal on ${formatDate(order.delivery_date)} cancelled. No refund applicable.`
      );

      await fetchOrder();
    } catch {
      setError('Failed to cancel. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelAll = async () => {
    const upcomingOrders = orders.filter((o) => o.status === 'upcoming');
    if (upcomingOrders.length === 0) return;

    const refundable = upcomingOrders.filter((o) => canCancelWithRefund(o.delivery_date));
    const nonRefundable = upcomingOrders.filter((o) => !canCancelWithRefund(o.delivery_date));

    const confirmMsg = `Cancel all ${upcomingOrders.length} upcoming meals?\n\n${refundable.length} meal(s) eligible for refund (${formatCurrency(refundable.length * MEAL_PRICE)})\n${nonRefundable.length} meal(s) not eligible for refund`;

    if (!confirm(confirmMsg)) return;

    setCancellingAll(true);
    setSuccessMessage('');

    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: subscription?.order_id,
          cancelAll: true,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to cancel orders.');
        return;
      }

      setSuccessMessage(
        `All upcoming meals cancelled. Refund of ${formatCurrency(refundable.length * MEAL_PRICE)} will be processed for ${refundable.length} eligible meal(s).`
      );

      await fetchOrder();
    } catch {
      setError('Failed to cancel. Please try again.');
    } finally {
      setCancellingAll(false);
    }
  };

  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const upcomingOrders = orders.filter((o) => o.status === 'upcoming');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Hero */}
      <div className="bg-[#800020] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#D4A843] mb-4">Track Your Order</h1>
          <p className="text-[#FFF8E7]/80 text-lg">
            Enter your Order ID to view your subscription details and manage your meals.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrder()}
              placeholder="Enter Order ID (e.g., RI-XXXXXXXX)"
              className="flex-1 px-4 py-3 border-2 border-[#D4A843]/30 rounded-xl text-[#1a0a00] placeholder-gray-400 focus:outline-none focus:border-[#D4A843] transition-colors text-lg"
            />
            <button
              onClick={fetchOrder}
              disabled={loading}
              className="px-8 py-3 bg-[#800020] text-[#D4A843] font-semibold rounded-xl hover:bg-[#600018] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-8">
            {successMessage}
          </div>
        )}

        {/* Subscription Info */}
        {subscription && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1a0a00] mb-2 sm:mb-0">
                  Subscription Details
                </h2>
                {getStatusBadge(subscription.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                  <p className="text-[#1a0a00] font-medium">{subscription.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-[#1a0a00] font-medium">{subscription.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <p className="text-[#1a0a00] font-medium font-mono">{subscription.order_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-[#1a0a00] font-medium">{subscription.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivery Days</p>
                  <p className="text-[#1a0a00] font-medium">
                    {Array.isArray(subscription.selected_days)
                      ? subscription.selected_days.join(', ')
                      : String(subscription.selected_days)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="text-[#1a0a00] font-medium">
                    {subscription.num_weeks} week{subscription.num_weeks > 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Meals</p>
                  <p className="text-[#1a0a00] font-medium">{subscription.total_meals}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-[#D4A843] font-bold text-xl">
                    {formatCurrency(subscription.total_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Cancel All Button */}
            {upcomingOrders.length > 0 && (
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleCancelAll}
                  disabled={cancellingAll}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancellingAll ? 'Cancelling...' : `Cancel All Upcoming (${upcomingOrders.length})`}
                </button>
              </div>
            )}

            {/* Delivered Orders */}
            {deliveredOrders.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#1a0a00] mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                  Delivered ({deliveredOrders.length})
                </h3>
                <div className="space-y-3">
                  {deliveredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <span className="text-green-800 font-medium">
                          {formatDate(order.delivery_date)}
                        </span>
                        <span className="text-green-700">{order.day}</span>
                        <span className="text-green-600 text-sm capitalize">{order.meal_type}</span>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-800 self-start sm:self-auto">
                        Delivered
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Orders */}
            {upcomingOrders.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#1a0a00] mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                  Upcoming ({upcomingOrders.length})
                </h3>
                <div className="space-y-3">
                  {upcomingOrders.map((order) => {
                    const refundEligible = canCancelWithRefund(order.delivery_date);
                    const cancellable = canCancelOrder(order.delivery_date);

                    return (
                      <div
                        key={order.id}
                        className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <span className="text-blue-800 font-medium">
                            {formatDate(order.delivery_date)}
                          </span>
                          <span className="text-blue-700">{order.day}</span>
                          <span className="text-blue-600 text-sm capitalize">{order.meal_type}</span>
                        </div>
                        {cancellable && (
                          <button
                            onClick={() => handleCancel(order)}
                            disabled={cancellingId === order.id}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto ${
                              refundEligible
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                                : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                            }`}
                          >
                            {cancellingId === order.id
                              ? 'Cancelling...'
                              : refundEligible
                              ? `Cancel (Refund ${formatCurrency(MEAL_PRICE)})`
                              : 'Cancel (No Refund)'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled Orders */}
            {cancelledOrders.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#1a0a00] mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                  Cancelled ({cancelledOrders.length})
                </h3>
                <div className="space-y-3">
                  {cancelledOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <span className="text-gray-600 font-medium line-through">
                          {formatDate(order.delivery_date)}
                        </span>
                        <span className="text-gray-500">{order.day}</span>
                        <span className="text-gray-400 text-sm capitalize">{order.meal_type}</span>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {order.refund_status && (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              order.refund_status === 'refunded'
                                ? 'bg-green-100 text-green-700'
                                : order.refund_status === 'no_refund'
                                ? 'bg-gray-200 text-gray-600'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.refund_status === 'refunded'
                              ? 'Refunded'
                              : order.refund_status === 'no_refund'
                              ? 'No Refund'
                              : 'Refund Pending'}
                          </span>
                        )}
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Cancelled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orders.length === 0 && !loading && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
                No meal orders found for this subscription.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

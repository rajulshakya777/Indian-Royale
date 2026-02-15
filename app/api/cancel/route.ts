import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { MEAL_PRICE } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = body.orderId || body.order_id;
    const cancelType = body.cancel_type;
    const singleOrderId = body.singleOrderId || body.order_id_to_cancel || body.order_id;
    const orderIds = body.orderIds || (singleOrderId && cancelType === "single" ? [singleOrderId] : undefined);
    const cancelAll =
      typeof body.cancelAll === "boolean"
        ? body.cancelAll
        : cancelType === "all";

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Fetch subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Determine which orders to cancel
    let ordersToCancel;

    if (cancelAll) {
      const { data, error } = await supabase
        .from("subscription_orders")
        .select("*")
        .eq("order_id", orderId)
        .eq("status", "upcoming");

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch orders" },
          { status: 500 }
        );
      }
      ordersToCancel = data;
    } else if (orderIds?.length) {
      const { data, error } = await supabase
        .from("subscription_orders")
        .select("*")
        .in("id", orderIds)
        .eq("order_id", orderId);

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch orders" },
          { status: 500 }
        );
      }
      ordersToCancel = data;
    } else {
      return NextResponse.json(
        { error: "Must provide orderIds or set cancelAll to true" },
        { status: 400 }
      );
    }

    if (!ordersToCancel?.length) {
      return NextResponse.json(
        { error: "No orders found to cancel" },
        { status: 404 }
      );
    }

    const now = new Date();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;
    let refundedCount = 0;
    let noRefundCount = 0;
    let totalRefund = 0;
    const cancelledOrderIds: string[] = [];

    for (const order of ordersToCancel) {
      const deliveryDate = new Date(order.delivery_date);

      // Can't cancel past orders
      if (deliveryDate <= now) {
        continue;
      }

      const timeUntilDelivery = deliveryDate.getTime() - now.getTime();
      const isRefundEligible = timeUntilDelivery > fortyEightHoursMs;

      let stripeRefundId: string | null = null;

      if (isRefundEligible && subscription.stripe_payment_intent_id) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: subscription.stripe_payment_intent_id,
            amount: MEAL_PRICE * 100,
          });
          stripeRefundId = refund.id;
          refundedCount++;
          totalRefund += MEAL_PRICE;
        } catch (refundError) {
          console.error("Stripe refund error:", refundError);
          // Continue processing even if refund fails
        }
      } else {
        noRefundCount++;
      }

      // Update the subscription order
      await supabase
        .from("subscription_orders")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          refund_status: isRefundEligible ? "refunded" : "no_refund",
          stripe_refund_id: stripeRefundId,
        })
        .eq("id", order.id);

      cancelledOrderIds.push(order.id);
    }

    // Create cancellation request record
    await supabase.from("cancellation_requests").insert({
      subscription_id: subscription.id,
      order_id: orderId,
      cancelled_order_ids: cancelledOrderIds,
      total_refund_amount: totalRefund,
      refund_eligible_count: refundedCount,
      no_refund_count: noRefundCount,
      reason: cancelAll ? "Cancel all upcoming orders" : "Cancel selected orders",
      status: "processed",
    });

    // If all orders are cancelled, update subscription status
    if (cancelAll) {
      const { data: remainingOrders } = await supabase
        .from("subscription_orders")
        .select("id")
        .eq("order_id", orderId)
        .eq("status", "upcoming");

      if (!remainingOrders?.length) {
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("order_id", orderId);
      }
    }

    return NextResponse.json({
      success: true,
      refundedCount,
      noRefundCount,
      totalRefund,
    });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

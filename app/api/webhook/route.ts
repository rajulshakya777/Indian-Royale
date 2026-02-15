import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { generateDeliveryDates, MEAL_PRICE } from "@/lib/utils";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabase();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order_id = session.metadata?.order_id;

    if (!order_id) {
      console.error("No order_id in session metadata");
      return NextResponse.json(
        { error: "Missing order_id in metadata" },
        { status: 400 }
      );
    }

    // Update subscription status to active
    const { data: subscription, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("order_id", order_id)
      .select()
      .single();

    if (updateError || !subscription) {
      console.error("Failed to update subscription:", updateError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    // Generate delivery dates and insert subscription_orders
    const deliveryDates = generateDeliveryDates(
      subscription.selected_days,
      subscription.num_weeks
    );

    const subscriptionOrders = deliveryDates.map((delivery) => ({
      subscription_id: subscription.id,
      order_id: subscription.order_id,
      delivery_date: delivery.date,
      day: delivery.day,
      meal_type: delivery.mealType,
      meal_price: MEAL_PRICE,
      status: "upcoming",
      refund_status: "none",
    }));

    const { error: ordersError } = await supabase
      .from("subscription_orders")
      .insert(subscriptionOrders);

    if (ordersError) {
      console.error("Failed to insert subscription orders:", ordersError);
      return NextResponse.json(
        { error: "Failed to create subscription orders" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { generateOrderId, MEAL_PRICE, MealType } from "@/lib/utils";

type SelectedDayInput = {
  day: string;
  mealType?: MealType;
  meals?: MealType[];
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const selectedDaysInput = (body.selectedDays || []) as SelectedDayInput[];
    const weeks = Number(body.weeks);
    const name = body.name || body.customer?.name;
    const email = body.email || body.customer?.email;
    const phone = body.phone || body.customer?.phone;
    const address = body.address || body.customer?.address;

    const selectedDays = selectedDaysInput.flatMap((entry) => {
      if (!entry?.day) return [];
      if (Array.isArray(entry.meals) && entry.meals.length > 0) {
        return entry.meals.map((mealType) => ({ day: entry.day, mealType }));
      }
      if (entry.mealType) {
        return [{ day: entry.day, mealType: entry.mealType }];
      }
      return [];
    });

    if (!selectedDays?.length || !weeks || !name || !email || !phone || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const total_meals = selectedDays.length * weeks;
    const total_amount = total_meals * MEAL_PRICE;
    const order_id = generateOrderId();

    const configuredDomain = process.env.NEXT_PUBLIC_DOMAIN?.trim();
    const requestOrigin = request.nextUrl.origin;
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? configuredDomain || requestOrigin
        : requestOrigin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "The Royale Indian - Meal Subscription",
            },
            unit_amount: Math.round(total_amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscribe/success?order_id=${order_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscribe`,
      metadata: {
        order_id,
        customer_email: email,
        customer_name: name,
      },
      customer_email: email,
    });

    const { error: dbError } = await supabase.from("subscriptions").insert({
      order_id,
      customer_email: email,
      customer_phone: phone,
      customer_name: name,
      customer_address: address,
      selected_days: selectedDays,
      num_weeks: weeks,
      total_meals,
      total_amount,
      stripe_session_id: session.id,
      status: "pending",
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to create subscription record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url, orderId: order_id });
  } catch (error) {
    console.error("Subscribe error:", error);
    const message =
      error instanceof Error ? error.message : "Unable to create Stripe checkout session";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface SubscriptionRow {
  created_at: string;
  total_amount: number | null;
  status: string | null;
  stripe_payment_intent_id: string | null;
  stripe_session_id?: string | null;
}

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

  const token = authHeader.split(" ")[1];
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  try {
    const decoded = atob(token);
    return decoded.startsWith(`${adminPassword}:`);
  } catch {
    return false;
  }
}

function getWeekStartUtc(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("created_at, total_amount, status, stripe_payment_intent_id, stripe_session_id")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const paid = (data || []).filter((row: SubscriptionRow) => {
      if (!row.total_amount || row.total_amount <= 0) return false;
      if (row.stripe_payment_intent_id) return true;
      return ["active", "completed", "cancelled"].includes(row.status || "");
    });

    const weeklyMap = new Map<string, { revenue: number; orders: number }>();
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    const yearlyMap = new Map<string, { revenue: number; orders: number }>();

    let totalRevenue = 0;
    let totalOrders = 0;

    for (const row of paid) {
      const date = new Date(row.created_at);
      const amount = Number(row.total_amount) || 0;
      const weekStart = getWeekStartUtc(date).toISOString().split("T")[0];
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      const yearKey = String(date.getUTCFullYear());

      const weekBucket = weeklyMap.get(weekStart) || { revenue: 0, orders: 0 };
      weekBucket.revenue += amount;
      weekBucket.orders += 1;
      weeklyMap.set(weekStart, weekBucket);

      const monthBucket = monthlyMap.get(monthKey) || { revenue: 0, orders: 0 };
      monthBucket.revenue += amount;
      monthBucket.orders += 1;
      monthlyMap.set(monthKey, monthBucket);

      const yearBucket = yearlyMap.get(yearKey) || { revenue: 0, orders: 0 };
      yearBucket.revenue += amount;
      yearBucket.orders += 1;
      yearlyMap.set(yearKey, yearBucket);

      totalRevenue += amount;
      totalOrders += 1;
    }

    const weekly = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        key,
        label: new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        revenue: value.revenue,
        orders: value.orders,
      }));

    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        key,
        label: monthLabel(key),
        revenue: value.revenue,
        orders: value.orders,
      }));

    const yearly = Array.from(yearlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        key,
        label: key,
        revenue: value.revenue,
        orders: value.orders,
      }));

    return NextResponse.json({
      success: true,
      data: {
        weekly,
        monthly,
        yearly,
        totals: {
          revenue: totalRevenue,
          orders: totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
      },
    });
  } catch (error) {
    console.error("Fetch analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  try {
    const decoded = atob(token);
    return decoded.startsWith(adminPassword + ':');
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('subscription_orders')
      .select('*')
      .order('delivery_date', { ascending: true });

    if (startDate) {
      query = query.gte('delivery_date', startDate);
    }

    if (endDate) {
      query = query.lte('delivery_date', endDate);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    // Aggregate by date
    const dailyMap: Record<string, { date: string; revenue: number; refunds: number; orderCount: number; deliveredCount: number; cancelledCount: number }> = {};

    let totalRevenue = 0;
    let totalRefunds = 0;
    let totalOrders = 0;

    for (const order of orders || []) {
      const date = order.delivery_date;
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          revenue: 0,
          refunds: 0,
          orderCount: 0,
          deliveredCount: 0,
          cancelledCount: 0,
        };
      }

      dailyMap[date].orderCount++;
      totalOrders++;

      if (order.status === 'delivered' || order.status === 'pending') {
        const price = order.meal_price || 0;
        dailyMap[date].revenue += price;
        totalRevenue += price;
      }

      if (order.status === 'delivered') {
        dailyMap[date].deliveredCount++;
      }

      if (order.status === 'cancelled') {
        dailyMap[date].cancelledCount++;
      }

      if (order.refund_status === 'refunded') {
        const refundAmount = order.meal_price || 0;
        dailyMap[date].refunds += refundAmount;
        totalRefunds += refundAmount;
      }
    }

    const dailyBreakdown = Object.values(dailyMap).sort(
      (a, b) => a.date.localeCompare(b.date)
    );

    return NextResponse.json({
      success: true,
      data: {
        daily: dailyBreakdown,
        totals: {
          revenue: totalRevenue,
          refunds: totalRefunds,
          net: totalRevenue - totalRefunds,
          totalOrders,
        },
      },
    });
  } catch (error) {
    console.error('Fetch sales error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}

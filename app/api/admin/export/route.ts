import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

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

async function fetchOrders(startDate: string | null, endDate: string | null) {
  let query = supabase
    .from('subscription_orders')
    .select('*, subscriptions(customer_name, customer_email, customer_phone, customer_address, order_id)')
    .order('delivery_date', { ascending: false });

  if (startDate) query = query.gte('delivery_date', startDate);
  if (endDate) query = query.lte('delivery_date', endDate);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((order) => ({
    'Order ID': order.order_id,
    'Subscription ID': order.subscription_id,
    'Customer Name': order.subscriptions?.customer_name || '',
    'Customer Email': order.subscriptions?.customer_email || '',
    'Customer Phone': order.subscriptions?.customer_phone || '',
    'Customer Address': order.subscriptions?.customer_address || '',
    'Subscription Order ID': order.subscriptions?.order_id || '',
    'Delivery Date': order.delivery_date,
    'Day': order.day,
    'Meal Type': order.meal_type,
    'Meal Price': order.meal_price,
    'Status': order.status,
    'Refund Status': order.refund_status || '',
    'Cancelled At': order.cancelled_at || '',
  }));
}

async function fetchSubscriptions(startDate: string | null, endDate: string | null) {
  let query = supabase
    .from('subscriptions')
    .select('*')
    .order('id', { ascending: false });

  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((sub) => ({
    'Order ID': sub.order_id,
    'Customer Name': sub.customer_name,
    'Customer Email': sub.customer_email,
    'Customer Phone': sub.customer_phone,
    'Customer Address': sub.customer_address,
    'Selected Days': JSON.stringify(sub.selected_days),
    'Num Weeks': sub.num_weeks,
    'Total Meals': sub.total_meals,
    'Total Amount': sub.total_amount,
    'Status': sub.status,
    'Payment Intent': sub.stripe_payment_intent_id || '',
  }));
}

async function fetchSales(startDate: string | null, endDate: string | null) {
  let query = supabase
    .from('subscription_orders')
    .select('*')
    .order('delivery_date', { ascending: true });

  if (startDate) query = query.gte('delivery_date', startDate);
  if (endDate) query = query.lte('delivery_date', endDate);

  const { data: orders, error } = await query;
  if (error) throw error;

  const dailyMap: Record<string, { date: string; revenue: number; refunds: number; orderCount: number }> = {};

  for (const order of orders || []) {
    const date = order.delivery_date;
    if (!dailyMap[date]) {
      dailyMap[date] = { date, revenue: 0, refunds: 0, orderCount: 0 };
    }
    dailyMap[date].orderCount++;
    if (order.status === 'delivered' || order.status === 'pending') {
      dailyMap[date].revenue += order.meal_price || 0;
    }
    if (order.refund_status === 'refunded') {
      dailyMap[date].refunds += order.meal_price || 0;
    }
  }

  return Object.values(dailyMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({
      'Date': day.date,
      'Total Orders': day.orderCount,
      'Revenue': day.revenue,
      'Refunds': day.refunds,
      'Net': day.revenue - day.refunds,
    }));
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'orders';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let data: Record<string, unknown>[];
    let sheetName: string;

    switch (type) {
      case 'subscriptions':
        data = await fetchSubscriptions(startDate, endDate);
        sheetName = 'Subscriptions';
        break;
      case 'sales':
        data = await fetchSales(startDate, endDate);
        sheetName = 'Sales';
        break;
      case 'orders':
      default:
        data = await fetchOrders(startDate, endDate);
        sheetName = 'Orders';
        break;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

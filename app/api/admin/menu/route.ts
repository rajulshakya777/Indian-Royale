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
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('day');

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Fetch menu error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ...fields } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Menu item id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(fields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update menu error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

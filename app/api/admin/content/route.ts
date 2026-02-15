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
      .from('site_content')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Fetch content error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { key, value, type } = await request.json();

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Content key is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('site_content')
      .upsert({ key, value, type }, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update site content' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

async function getSessionUser(request: NextRequest) {
  const token = request.cookies.get('zamzam_session')?.value;
  if (!token) return null;
  const { data: session } = await getSupabaseAdmin()
    .from('sessions')
    .select('user_data')
    .eq('token', token)
    .single();
  if (!session || !session.user_data) return null;
  return session.user_data as { id: string; role: string };
}

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data: users } = await getSupabaseAdmin()
    .from('users')
    .select('id, username, name, role, created_at');

  return NextResponse.json({ users: users || [] });
}

export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { id, username, password, name, role, created_at } = body;

  const { error } = await getSupabaseAdmin().from('users').insert({
    id, username, password, name, role, created_at,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await getSupabaseAdmin().from('sessions').delete().eq('user_id', id);
  await getSupabaseAdmin().from('users').delete().eq('id', id);

  return NextResponse.json({ ok: true });
}

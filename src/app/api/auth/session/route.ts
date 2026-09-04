import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('zamzam_session')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { data: session } = await getSupabaseAdmin()
    .from('sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) {
    if (session) {
      await getSupabaseAdmin().from('sessions').delete().eq('token', token);
    }
    const response = NextResponse.json({ user: null }, { status: 401 });
    response.cookies.set('zamzam_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json({ user: session.user_data });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('zamzam_session')?.value;

  if (token) {
    await getSupabaseAdmin().from('sessions').delete().eq('token', token);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('zamzam_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

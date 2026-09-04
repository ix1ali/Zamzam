import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;
const SESSION_DAYS = 7;

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
  }

  const uname = (username as string).toLowerCase();

  const { data: attempt } = await getSupabaseAdmin()
    .from('login_attempts')
    .select('*')
    .eq('username', uname)
    .single();

  if (attempt?.locked_until) {
    const lockEnd = new Date(attempt.locked_until);
    if (lockEnd > new Date()) {
      const secondsLeft = Math.ceil((lockEnd.getTime() - Date.now()) / 1000);
      return NextResponse.json(
        { error: `محاولات كثيرة. حاول بعد ${Math.ceil(secondsLeft / 60)} دقيقة` },
        { status: 429 }
      );
    }
  }

  const { data: user } = await getSupabaseAdmin()
    .from('users')
    .select('*')
    .ilike('username', uname)
    .single();

  if (!user || user.password !== password) {
    const newCount = (attempt?.attempt_count || 0) + 1;
    const lockUntil = newCount >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
      : null;

    await getSupabaseAdmin().from('login_attempts').upsert({
      username: uname,
      attempt_count: newCount,
      locked_until: lockUntil,
      last_attempt: new Date().toISOString(),
    }, { onConflict: 'username' });

    if (newCount >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: `محاولات كثيرة. حاول بعد ${LOCKOUT_MINUTES} دقيقة` },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
  }

  await getSupabaseAdmin().from('login_attempts').delete().eq('username', uname);

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const userData = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
  };

  await getSupabaseAdmin().from('sessions').insert({
    token,
    user_id: user.id,
    user_data: userData,
    expires_at: expiresAt.toISOString(),
  });

  const response = NextResponse.json({ user: userData });
  response.cookies.set('zamzam_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });

  return response;
}

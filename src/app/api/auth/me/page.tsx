import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Forward cookies to backend so session is preserved
    const cookie = req.headers.get('cookie') || '';

    const res = await fetch('http://localhost:4000/auth/me', {
      headers: { cookie },
      credentials: 'include',
    });

    if (!res.ok) {
      return NextResponse.json(null, { status: 401 });
    }

    const user = await res.json();
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(null, { status: 500 });
  }
}

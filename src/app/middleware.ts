// src/middleware.ts (or just /middleware.ts depending on your project structure)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('id_token')?.value;

  if (request.nextUrl.pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on these routes
export const config = {
  matcher: ['/', '/login'], // adjust to your routes
};

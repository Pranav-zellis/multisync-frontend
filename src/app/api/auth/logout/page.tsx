import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to NestJS backend logout endpoint
  return NextResponse.redirect('http://localhost:4000/auth/logout');
}

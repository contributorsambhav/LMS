import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  
  // Clear the session cookie
  cookieStore.delete('lms-session');
  
  // Redirect back to login
  const url = new URL('/login', req.url);
  return NextResponse.redirect(url);
}

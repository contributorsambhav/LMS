import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, picture, token, id, instituteId, status } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing required session fields' }, { status: 400 });
    }

    // Require a backend-issued token to create a session
    if (!token) {
      return NextResponse.json({ error: 'Client-side session creation is disabled. Please authenticate via the backend.' }, { status: 403 });
    }

    const sessionObj: any = { name, email, role, picture };
    if (token) sessionObj.token = token;
    if (id) sessionObj.id = id;
    if (instituteId !== undefined) sessionObj.instituteId = instituteId;
    if (status) sessionObj.status = status;

    const sessionValue = encodeURIComponent(JSON.stringify(sessionObj));

    const response = NextResponse.json({ success: true, session: sessionObj });

    // Set cookie that lasts for 7 days
    response.headers.append('Set-Cookie', `lms-session=${sessionValue}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; HttpOnly; Secure`);

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session request' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  // Expire the cookie
  response.headers.append('Set-Cookie', `lms-session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly; Secure`);

  return response;
}

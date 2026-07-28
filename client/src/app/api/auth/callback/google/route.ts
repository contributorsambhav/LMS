import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const stateStr = searchParams.get("state") || "";
  const error = searchParams.get("error");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = req.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", req.url));
  }

  try {
    // Deserialize state JSON from base64
    let role = "student";
    let action = "login";
    let registrationDetails: any = null;

    try {
      const decodedState = JSON.parse(Buffer.from(stateStr, "base64").toString("utf-8"));
      role = decodedState.role || "student";
      action = decodedState.action || "login";
      registrationDetails = decodedState;
    } catch (e) {
      // Fallback to plain string state if decoding fails (old behavior compatibility)
      role = (stateStr || "student");
    }

    // 1. Exchange the authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${nextAuthUrl}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL(`/login?error=token_exchange_failed&details=${encodeURIComponent(JSON.stringify(errorData))}`, req.url)
      );
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // 2. Fetch the user info from Google's Userinfo API
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userinfoResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=fetch_userinfo_failed", req.url));
    }

    const googleUser = await userinfoResponse.json();

    // Map next.js client roles to backend Mongoose roles
    const roleMap: Record<string, string> = {
      student: "Student",
      faculty: "Faculty",
      admin: "InstituteAdmin",
      super: "SuperAdmin"
    };

    const backendRole = roleMap[role] || "Student";

    // 3. Authenticate / Register with Express backend
    const backendResponse = await fetch(`${API_BASE_URL}/api/auth/oauth-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: (registrationDetails && registrationDetails.legalName) ? registrationDetails.legalName : (googleUser.name || "Google User"),
        email: googleUser.email,
        role: backendRole,
        picture: googleUser.picture || "",
        registrationDetails,
        action
      })
    });

    if (backendResponse.status === 403) {
      return NextResponse.redirect(new URL(`/login?error=suspended_account`, req.url));
    }

    if (backendResponse.status === 409) {
      const errorData = await backendResponse.json();
      return NextResponse.redirect(new URL(`/login?error=role_mismatch&msg=${encodeURIComponent(errorData.message)}`, req.url));
    }

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error("Backend login failed:", errorData);
      return NextResponse.redirect(
        new URL(`/login?error=backend_auth_failed&details=${encodeURIComponent(JSON.stringify(errorData))}`, req.url)
      );
    }

    const backendData = await backendResponse.json();

    // 4. Construct the session object
    const sessionUser = {
      name: backendData.user.name,
      email: backendData.user.email,
      role: role, // Keep original student/faculty/admin/super for frontend components
      picture: backendData.user.picture,
      token: backendData.token,
      id: backendData.user.id,
      instituteId: backendData.user.instituteId,
      status: backendData.user.status // Store approval status in session
    };

    const sessionValue = encodeURIComponent(JSON.stringify(sessionUser));
    
    // 5. Create the redirection response to the corresponding dashboard
    const response = NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    
    // Set secure HTTP-only cookie
    response.headers.append(
      "Set-Cookie",
      `lms-session=${sessionValue}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; HttpOnly; Secure`
    );

    return response;
  } catch (err: any) {
    console.error("OAuth Callback Error:", err);
    
    let errMsg = err.message || "Unknown error";
    // Check if the error is a Node.js network connection error
    if (errMsg === "fetch failed" || err.code === "ECONNREFUSED") {
      errMsg = "The backend authentication server is currently offline or unreachable. Please try again later.";
    }

    return NextResponse.redirect(
      new URL(`/login?error=oauth_internal_error&msg=${encodeURIComponent(errMsg)}`, req.url)
    );
  }
}

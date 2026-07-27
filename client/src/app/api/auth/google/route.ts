import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const role = searchParams.get("role") || "student"; // Default to student if none provided

  // Capture onboarding info
  const legalName = searchParams.get("legalName");
  const brandName = searchParams.get("brandName");
  const phoneNumber = searchParams.get("phoneNumber");
  const address = searchParams.get("address");
  const instituteId = searchParams.get("instituteId");
  const billingPlan = searchParams.get("billingPlan");
  const razorpay_payment_id = searchParams.get("razorpay_payment_id");
  const razorpay_order_id = searchParams.get("razorpay_order_id");
  const razorpay_signature = searchParams.get("razorpay_signature");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL as string;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL(`/login?error=no_credentials`, req.url));
  }

  const action = searchParams.get("action") || "login";

  // Construct state JSON object and base64-encode it
  const stateObj: any = { role, action };
  if (legalName) stateObj.legalName = legalName;
  if (brandName) stateObj.brandName = brandName;
  if (phoneNumber) stateObj.phoneNumber = phoneNumber;
  if (address) stateObj.address = address;
  if (instituteId) stateObj.instituteId = instituteId;
  if (billingPlan) stateObj.billingPlan = billingPlan;
  if (razorpay_payment_id) stateObj.razorpay_payment_id = razorpay_payment_id;
  if (razorpay_order_id) stateObj.razorpay_order_id = razorpay_order_id;
  if (razorpay_signature) stateObj.razorpay_signature = razorpay_signature;

  const base64State = Buffer.from(JSON.stringify(stateObj)).toString("base64");

  // Construct standard Google OAuth authorization URL
  const redirectUri = `${nextAuthUrl}/api/auth/callback/google`;
  const scopes = "openid email profile";
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${base64State}`;

  return NextResponse.redirect(googleAuthUrl);
}

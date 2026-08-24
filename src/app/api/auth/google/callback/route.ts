import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${request.nextUrl.origin}/?calendar=denied`);
  }
  if (!code) {
    return NextResponse.json({ error: "code parametresi eksik" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth env değişkenleri eksik" }, { status: 500 });
  }

  const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`;

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${request.nextUrl.origin}/?calendar=error`);
  }

  const json = await tokenRes.json();
  const expiresAt = new Date(Date.now() + json.expires_in * 1000).toISOString();

  await supabaseAdmin.from("integration_tokens").upsert({
    provider: "google",
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: expiresAt,
  });

  return NextResponse.redirect(`${request.nextUrl.origin}/?calendar=connected`);
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isGoogleConnected } from "@/lib/googleCalendar";

export async function GET() {
  const connected = await isGoogleConnected();
  return NextResponse.json({ connected });
}

export async function DELETE() {
  await supabaseAdmin.from("integration_tokens").delete().eq("provider", "google");
  return NextResponse.json({ success: true });
}

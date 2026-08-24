import { supabaseAdmin } from "./supabaseAdmin";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const TIMEZONE = "Europe/Istanbul";

interface TokenRow {
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
}

export async function isGoogleConnected(): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("integration_tokens")
    .select("refresh_token")
    .eq("provider", "google")
    .maybeSingle();
  return !!data?.refresh_token;
}

async function getValidAccessToken(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("integration_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("provider", "google")
    .maybeSingle<TokenRow>();

  if (!data?.refresh_token) return null;

  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : 0;
  const stillValid = data.access_token && expiresAt - Date.now() > 60_000;
  if (stillValid) return data.access_token;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET tanımlı olmalı");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    return null;
  }

  const json = await res.json();
  const newExpiresAt = new Date(Date.now() + json.expires_in * 1000).toISOString();

  await supabaseAdmin
    .from("integration_tokens")
    .update({ access_token: json.access_token, expires_at: newExpiresAt })
    .eq("provider", "google");

  return json.access_token as string;
}

interface CalendarTask {
  title: string;
  notes: string | null;
  start_time: string;
  end_time: string;
}

export async function upsertCalendarEvent(
  task: CalendarTask,
  existingEventId: string | null
): Promise<string | null> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;

  const body = {
    summary: task.title,
    description: task.notes ?? undefined,
    start: { dateTime: task.start_time, timeZone: TIMEZONE },
    end: { dateTime: task.end_time, timeZone: TIMEZONE },
  };

  const url = existingEventId ? `${EVENTS_URL}/${existingEventId}` : EVENTS_URL;
  const method = existingEventId ? "PATCH" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Etkinlik dashboard dışından silinmiş olabilir; yeniden oluşturmayı dene.
    if (existingEventId && res.status === 404) {
      return upsertCalendarEvent(task, null);
    }
    return null;
  }

  const json = await res.json();
  return json.id as string;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return;

  await fetch(`${EVENTS_URL}/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

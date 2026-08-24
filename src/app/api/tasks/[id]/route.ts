import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { TaskStatus } from "@/types";
import { deleteCalendarEvent, upsertCalendarEvent } from "@/lib/googleCalendar";

const VALID_STATUSES: TaskStatus[] = ["yapilacak", "yapiliyor", "tamamlandi"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const {
    status,
    title,
    bucket_id,
    project_id,
    notes,
    deadline,
    importance,
    urgency,
    start_time,
    end_time,
  } = body;

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "geçersiz status" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) {
    updates.status = status;
    updates.completed_at = status === "tamamlandi" ? new Date().toISOString() : null;
  }
  if (title) updates.title = title;
  if (bucket_id !== undefined) updates.bucket_id = bucket_id;
  if (project_id !== undefined) updates.project_id = project_id;
  if (notes !== undefined) updates.notes = notes;
  if (deadline !== undefined) updates.deadline = deadline;
  if (importance !== undefined) updates.importance = importance;
  if (urgency !== undefined) updates.urgency = urgency;
  if (start_time !== undefined) updates.start_time = start_time;
  if (end_time !== undefined) updates.end_time = end_time;

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const touchesCalendar =
    "start_time" in body || "end_time" in body || title !== undefined || notes !== undefined;

  if (touchesCalendar) {
    try {
      if (data.start_time && data.end_time) {
        const eventId = await upsertCalendarEvent(
          { title: data.title, notes: data.notes, start_time: data.start_time, end_time: data.end_time },
          data.google_event_id
        );
        if (eventId && eventId !== data.google_event_id) {
          await supabase.from("tasks").update({ google_event_id: eventId }).eq("id", id);
          data.google_event_id = eventId;
        }
      } else if (data.google_event_id) {
        await deleteCalendarEvent(data.google_event_id);
        await supabase.from("tasks").update({ google_event_id: null }).eq("id", id);
        data.google_event_id = null;
      }
    } catch {
      // Calendar senkronu başarısız olsa da görev güncellemesi geçerli kalır.
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data: existing } = await supabase
    .from("tasks")
    .select("google_event_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existing?.google_event_id) {
    try {
      await deleteCalendarEvent(existing.google_event_id);
    } catch {
      // Görev zaten silindi; takvim etkinliği elde kalabilir, kritik değil.
    }
  }

  return NextResponse.json({ success: true });
}

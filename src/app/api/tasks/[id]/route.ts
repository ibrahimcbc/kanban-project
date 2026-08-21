import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { TaskStatus } from "@/types";

const VALID_STATUSES: TaskStatus[] = ["yapilacak", "yapiliyor", "tamamlandi"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, title, category } = body;

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "geçersiz status" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) {
    updates.status = status;
    updates.completed_at = status === "tamamlandi" ? new Date().toISOString() : null;
  }
  if (title) updates.title = title;
  if (category) updates.category = category;

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

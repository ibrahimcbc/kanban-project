import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ProjectStatus } from "@/types";

const VALID_STATUSES: ProjectStatus[] = ["ongoing", "deadline", "favorite", "finished", "archived"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, bucket_id, status, deadline } = body;

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "geçersiz status" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) updates.name = name;
  if (bucket_id !== undefined) updates.bucket_id = bucket_id;
  if (status) updates.status = status;
  if (deadline !== undefined) updates.deadline = deadline;

  const { data, error } = await supabase
    .from("projects")
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
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

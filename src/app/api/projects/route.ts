import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, bucket_id, status, deadline } = body;

  if (!name) {
    return NextResponse.json({ error: "name zorunlu" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      bucket_id: bucket_id ?? null,
      status: status ?? "ongoing",
      deadline: deadline ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

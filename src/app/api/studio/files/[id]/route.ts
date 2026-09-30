import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFile } from "@/lib/studio/storage";

export const runtime = "nodejs";

// RLS on studio_generations means a user can only ever resolve their own rows.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("studio_generations")
    .select("file_key, mime_type")
    .eq("id", id)
    .single();
  if (!row?.file_key) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const data = await readFile(row.file_key);
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": row.mime_type ?? "application/octet-stream", "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}

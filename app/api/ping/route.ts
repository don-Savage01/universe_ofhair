import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Lightweight query that just wakes the database
    await supabase.from("products").select("id").limit(1);
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

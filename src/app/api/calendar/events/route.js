import { NextResponse } from "next/server";
import { getCalendarEvents, createCalendarEvent } from "@/lib/db";

export async function GET() {
  try {
    const events = await getCalendarEvents();
    return NextResponse.json(events, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const created = await createCalendarEvent(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const status = err.status || 400;
    return NextResponse.json(
      { error: err.error || "BAD_REQUEST", message: err.message },
      { status }
    );
  }
}

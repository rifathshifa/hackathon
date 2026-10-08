import { NextResponse } from "next/server";
import { updateCalendarEvent, deleteCalendarEvent } from "@/lib/db";

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams?.eventId;
    const body = await req.json();
    const updated = await updateCalendarEvent(eventId, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    const status = err.status || 400;
    return NextResponse.json(
      { error: err.error || "BAD_REQUEST", message: err.message },
      { status }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams?.eventId;
    const result = await deleteCalendarEvent(eventId);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const status = err.status || 404;
    return NextResponse.json(
      { error: err.error || "NOT_FOUND", message: err.message },
      { status }
    );
  }
}

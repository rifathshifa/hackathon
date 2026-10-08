import { NextResponse } from "next/server";
import { getBookings, createBooking } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get("equipment_id");
    const bookings = await getBookings(equipmentId);
    return NextResponse.json(bookings, { status: 200 });
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
    const newBooking = await createBooking(body);
    return NextResponse.json(newBooking, { status: 201 });
  } catch (err) {
    const status = err.status || 400;
    return NextResponse.json(
      {
        error: err.error || "BAD_REQUEST",
        message: err.message,
        suggestedSlot: err.suggestedSlot || null,
        conflictingBooking: err.conflictingBooking || null,
      },
      { status }
    );
  }
}

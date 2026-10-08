import { NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/db";

export async function POST(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const body = await req.json();
    const result = await updateBookingStatus(id, body.status);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const status = err.status || 500;
    return NextResponse.json(
      { error: err.error || "INTERNAL_ERROR", message: err.message },
      { status }
    );
  }
}

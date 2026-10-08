import { NextResponse } from "next/server";
import { approveBooking } from "@/lib/db";

export async function POST(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const result = await approveBooking(id);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const status = err.status || 500;
    return NextResponse.json(
      { error: err.error || "NOT_FOUND", message: err.message },
      { status }
    );
  }
}

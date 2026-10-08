import { NextResponse } from "next/server";
import { getEquipmentList, createEquipment } from "@/lib/db";

export async function GET() {
  try {
    const list = await getEquipmentList();
    return NextResponse.json(list, { status: 200 });
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
    const created = await createEquipment(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const status = err.status || 400;
    return NextResponse.json(
      { error: err.error || "BAD_REQUEST", message: err.message },
      { status }
    );
  }
}

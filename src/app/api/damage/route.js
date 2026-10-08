import { NextResponse } from "next/server";
import { getDamageReports, reportDamage } from "@/lib/db";

export async function GET() {
  try {
    const list = await getDamageReports();
    return NextResponse.json(list, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const created = await reportDamage(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "BAD_REQUEST", message: err.message }, { status: 400 });
  }
}

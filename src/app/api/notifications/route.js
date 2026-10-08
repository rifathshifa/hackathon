import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const notifications = await getNotifications(role);
    return NextResponse.json(notifications, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

// Predefined accounts for deterministic authentication
const DEMO_USERS = {
  student: {
    id: "STU-2026-081",
    name: "Alex Rivera",
    email: "student@equipx.edu",
    password: "student123",
    role: "STUDENT",
    department: "Robotics & Autonomous Systems",
    avatar: "AR",
    permissions: ["book_equipment", "scan_qr", "view_availability", "view_own_bookings"],
  },
  staff: {
    id: "FAC-2026-902",
    name: "Dr. Evelyn Vance",
    email: "staff@equipx.edu",
    password: "staff123",
    role: "STAFF",
    department: "Advanced Materials & Optics Lab",
    avatar: "EV",
    permissions: ["manage_inventory", "approve_bookings", "reject_bookings", "issue_equipment", "log_maintenance", "track_damage"],
  },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Email / ID and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const targetRole = role ? String(role).toUpperCase() : null;

    // Check staff match
    if (
      targetRole === "STAFF" ||
      cleanEmail === "staff@equipx.edu" ||
      cleanEmail === "admin@equipx.edu" ||
      cleanEmail.startsWith("fac-") ||
      cleanEmail.startsWith("staff-")
    ) {
      if (password === "staff123" || password === "password123" || password.length >= 4) {
        const user = {
          ...DEMO_USERS.staff,
          email: cleanEmail.includes("@") ? cleanEmail : "staff@equipx.edu",
          token: `jwt-staff-${Date.now()}`,
        };
        return NextResponse.json({ success: true, user });
      }
    }

    // Check student match
    if (
      targetRole === "STUDENT" ||
      cleanEmail === "student@equipx.edu" ||
      cleanEmail.startsWith("stu-") ||
      !targetRole
    ) {
      if (password === "student123" || password === "password123" || password.length >= 4) {
        const user = {
          ...DEMO_USERS.student,
          email: cleanEmail.includes("@") ? cleanEmail : "student@equipx.edu",
          token: `jwt-student-${Date.now()}`,
        };
        return NextResponse.json({ success: true, user });
      }
    }

    return NextResponse.json(
      { error: "AUTH_FAILED", message: "Invalid email/ID or password. Use demo credentials." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth route error:", error);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error.message || "Authentication error." },
      { status: 500 }
    );
  }
}

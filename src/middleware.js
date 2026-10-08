import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const accept = request.headers.get("accept") || "";
  const method = request.method;

  // An automated contract test or API client sends accept: application/json or uses POST/PUT/DELETE
  const isExplicitApi =
    accept.includes("application/json") ||
    request.headers.get("content-type")?.includes("application/json") ||
    method !== "GET";

  // If request explicitly targets OpenAPI routes as an API client
  if (pathname === "/equipment" && isExplicitApi) {
    return NextResponse.rewrite(new URL("/api/equipment", request.url));
  }

  if (pathname === "/bookings" && isExplicitApi) {
    return NextResponse.rewrite(new URL("/api/bookings", request.url));
  }

  if (pathname.startsWith("/bookings/") && pathname.endsWith("/approve")) {
    return NextResponse.rewrite(new URL(`/api${pathname}`, request.url));
  }

  if (pathname.startsWith("/calendar/events") && isExplicitApi) {
    return NextResponse.rewrite(new URL(`/api${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/equipment",
    "/bookings",
    "/bookings/:id/approve",
    "/calendar/events",
    "/calendar/events/:path*",
  ],
};

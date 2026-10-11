import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/jwt";

// Runs before every page listed in `matcher` below.
// First line of defence: not logged in -> /login, wrong role -> your own home page.
// (Pages and API routes still call requireUser() themselves as a second check.)
export async function middleware(request: NextRequest) {
  const session = await verifyToken(request.cookies.get(SESSION_COOKIE)?.value);
  const path = request.nextUrl.pathname;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (path.startsWith("/teacher") && session.role !== "TEACHER") {
    return NextResponse.redirect(new URL("/student", request.url));
  }
  if (path.startsWith("/student") && session.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/syllabus"],
};

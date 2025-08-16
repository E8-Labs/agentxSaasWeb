import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Redirect ONLY /agency (and /agency/) to /
  if (pathname === "/agency" || pathname === "/agency/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Security headers
  if (pathname.startsWith("/embed/vapi")) {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "ALLOWALL");
    res.headers.set(
      [
        "default-src 'none'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors *",
      ].join("; ")
    );
    return res;
  }

  // Public paths
  if (
    pathname === "/" ||
    pathname === "/onboarding" ||
    pathname === "/onboarding/WaitList" ||
    pathname.startsWith("/recordings/")
  ) {
    return NextResponse.next();
  }

  // Auth gate
  const userCookie = request.cookies.get("User");
  if (!userCookie) {
    if (pathname.startsWith("/createagent")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/agency",                 // <-- add exact /agency
    "/createagent/:path*",
    "/pipeline/:path*",
    "/sellerkycquestions/:path*",
    "/buyerkycquestions/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/embedCalendar/:path*",
    "/agency/dashboard/:path*", // subpaths still processed normally
  ],
};

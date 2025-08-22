import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Redirect ONLY /agency (and /agency/) to /
  if (pathname === "/agency" || pathname === "/agency/") {
    console.log("Running this /agency stricted path");
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
    pathname.startsWith === ("/agency/onboarding") ||
    pathname.startsWith === ("/agency/verify") ||
    pathname.startsWith("/recordings/")
  ) {
    return NextResponse.next();
  }

  // Grab User cookie
  const userCookie = request.cookies.get("User");

  if (!userCookie) {
    // Not logged in → always send home
    return NextResponse.redirect(new URL("/", request.url));
  }

  let user;

  if (pathname.startsWith("/createagent") || pathname.startsWith("/pipeline")) {
    return NextResponse.next();
  }

  try {
    user = JSON.parse(decodeURIComponent(userCookie.value));
    console.log("User cookie parsed value is", user);
  } catch (err) {
    console.error("Invalid User cookie:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🚨 Force re-login if cookie is outdated (missing userRole or userType)
  if (!user.userRole || !user.userType) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("User"); // clear old cookie
    return response;
  }

  // ---- Centralized redirect rule (same as client router.push) ----
  let expectedPath = null;

  if (user.userType === "admin") {
    expectedPath = "/admin";
  } else if (user.userRole === "AgencySubAccount") {
    expectedPath = "/dashboard";
  } else if (user.userRole === "Agency" || user.agencyTeammember === true) {
    expectedPath = "/agency/dashboard";
  } else {
    expectedPath = "/dashboard";
  }

  // ---- If the user is NOT on their expected path, redirect them ----
  if (!pathname.startsWith(expectedPath)) {
    return NextResponse.redirect(new URL(expectedPath, request.url));
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

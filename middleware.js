import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Grab User cookie early (needed for /agency redirect too)
  const userCookie = request.cookies.get("User");
  let user = null;

  if (user === null) {
    console.log("not found user")
  }

  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value));
    } catch (err) {
      console.error("Invalid User cookie:", err);
    }
  }

  // ---- Redirect ONLY /agency (and /agency/) ----
  if (pathname === "/agency" || pathname === "/agency/") {
    if (user) {
      // Logged-in agency user → dashboard
      return NextResponse.redirect(new URL("/agency/dashboard", request.url));
    }
    // Not logged in → send home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ---- Security headers for embed ----
  if (pathname.startsWith("/embed/vapi")) {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "ALLOWALL");
    res.headers.set(
      "Content-Security-Policy",
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

  // ---- Public paths ----
  if (
    pathname === "/" ||
    pathname === "/onboarding" ||
    pathname === "/onboarding/WaitList" ||
    pathname.startsWith("/onboarding/") || // allows /onboarding/[uuid]
    pathname.startsWith("/agency/onboarding") ||
    pathname.startsWith("/agency/verify") ||
    pathname.startsWith("/recordings/")
  ) {
    return NextResponse.next();
  }

  // ---- Require login for everything else ----
  if (!user) {
    // Not logged in → always send home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🚨 Force re-login if cookie is outdated (missing userRole or userType)
  // if (!user.userRole || !user.userType) {
  //   // Allow request to proceed without deleting cookie to avoid instant logout on fresh login
  //   return NextResponse.next();
  // }
  console.log("User data is", user);
  // ---- Centralized redirect rule ----
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

  // ✅ UPDATE: Skip redirect enforcement for certain paths
  if (
    pathname.startsWith("/createagent") ||
    pathname.startsWith("/pipeline")
  ) {
    return NextResponse.next();
  }

  // ---- Prevent redirect loops ----
  if (
    pathname !== expectedPath && // exact base mismatch
    !pathname.startsWith(expectedPath + "/") // allow deeper subpaths
  ) {
    return NextResponse.redirect(new URL(expectedPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/agency", // exact /agency
    "/createagent/:path*",
    "/pipeline/:path*",
    "/sellerkycquestions/:path*",
    "/buyerkycquestions/:path*",
    "/dashboard/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/admin/:path*",
    "/embedCalendar/:path*",
    "/agency/dashboard/:path*", // subpaths processed normally
  ],
};

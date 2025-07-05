import { NextResponse } from "next/server";

export function middleware(request) {
  // //console.log;

  const { pathname } = request.nextUrl;

  // === 1. SECURITY HEADERS FOR IFRAME EMBED WIDGETS ===
  if (pathname.startsWith("/embed/vapi")) {
    const res = NextResponse.next();

    // Set security headers
    res.headers.set("X-Frame-Options", "ALLOWALL"); // Or restrict to trusted domains if needed
    res.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'none'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors *", // Or specify trusted parent domains
      ].join("; ")
    );
    return res;
  }
  // Allow unauthenticated access to specific paths
  const allowedPaths = ["/", "/onboarding", "/onboarding/WaitList"];
  if (allowedPaths.includes(pathname)) {
    // //console.log;
    return NextResponse.next();
  }

  // Retrieve the user cookie
  // //console.log;
  const userCookie = request.cookies.get("User");
  // //console.log;

  if (!userCookie) {
    // //console.log;

    // Check if the user is trying to access the createagent route
    if (pathname.startsWith("/createagent")) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("redirect", pathname); // Add redirect query param
      // console.log(
      //   "Redirecting to login with redirect URL:",
      //   loginUrl.toString()
      // );
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL("/", request.url)); // Default redirect for other paths
  }

  // Proceed to the requested page
  // //console.log;
  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/createagent/:path*",
    "/pipeline/:path*",
    "/sellerkycquestions/:path*",
    "/buyerkycquestions/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
};

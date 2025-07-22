import { NextResponse } from "next/server";

export function middleware(request) {
  // //console.log;

  // Allow unauthenticated access to specific paths
  const allowedPaths = ["/", "/onboarding", "/onboarding/WaitList", "/recordings/:path*"];
  if (allowedPaths.includes(request.nextUrl.pathname)) {
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
    if (request.nextUrl.pathname.startsWith("/createagent")) {
      const loginUrl = new URL("/", request.url);
      // loginUrl.searchParams.set("redirect", request.nextUrl.pathname); // Add redirect query param
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
    "/createagent/:path*",
    "/pipeline/:path*",
    "/sellerkycquestions/:path*",
    "/buyerkycquestions/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    // "/recordings/:path*",
  ],
};

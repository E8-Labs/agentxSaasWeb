import { NextResponse } from "next/server";

export function middleware(request) {
  console.log("Running middleware on path:", request.nextUrl.pathname);

  // Allow unauthenticated access to specific paths
  const allowedPaths = ["/", "/onboarding", "/onboarding/WaitList"];
  if (allowedPaths.includes(request.nextUrl.pathname)) {
    console.log("Allowed path, skipping middleware:", request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Retrieve the user cookie
  console.log("All Cookies:", request.cookies);
  const userCookie = request.cookies.get("User");
  console.log("User Cookie Value:", userCookie);

  if (!userCookie) {
    console.log("No User cookie found, redirecting...");

    // Check if the user is trying to access the createagent route
    if (request.nextUrl.pathname.startsWith("/createagent")) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname); // Add redirect query param
      console.log(
        "Redirecting to login with redirect URL:",
        loginUrl.toString()
      );
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL("/", request.url)); // Default redirect for other paths
  }

  // Proceed to the requested page
  console.log("User authenticated, proceeding...");
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
  ],
};

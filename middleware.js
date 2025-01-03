import { NextResponse } from "next/server";

export function middleware(request) {
    console.log("Running middleware");

    // Retrieve the user data from cookies
    if (request.nextUrl.pathname == "/" || request.nextUrl.pathname == "/onboarding") {
        // No redirection needed for these paths
    } else if (request.nextUrl.pathname == "/onboarding/WaitList") {
        // Do not route the user from this specific path
        return //NextResponse.next();
    } else {
        const userCookie = request.cookies.get("User");
        console.log("User Cookie:", userCookie);
        if (!userCookie) {
            // Redirect user to home page if they are not authenticated and not on allowed paths
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();  // Proceed if no conditions are met
}

export const config = {
    matcher: [
        "/createagent/:path*",
        "/pipeline/:path*",
        "/sellerkycquestions/:path*",
        "/buyerkycquestions/:path*",
        "/dashboard/:path*",
        "/onboarding/:path*"
    ]
}

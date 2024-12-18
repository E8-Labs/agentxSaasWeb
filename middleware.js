import { NextResponse } from "next/server";

export function middleware(request) {
    // console.log("Trying middle ware");
    // const localData = localStorage.getItem("User");
    // if (!localData) {
    console.log("Running middleware");

    // Retrieve the user data from cookies

    if (request.nextUrl.pathname == "/" || request.nextUrl.pathname == "/onboarding") {

    }
    else {
        const userCookie = request.cookies.get("User");
        console.log("User Cookie:", userCookie);
        if (!userCookie) {
            if (request.nextUrl.pathname != ["/", "/onboarding"]) {
                return NextResponse.redirect(new URL("/", request.url))
            }
        }
    }


    // }

}

export const config = {
    matcher: ["/createagent/:path*", "/pipeline/:path*", "/sellerkycquestions/:path*", "/buyerkycquestions/:path*", "/dashboard/:path*", "/onboarding/:path*"]
}

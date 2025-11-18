import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serialize } from "cookie";

/**
 * GET /api/auth/session
 * Returns current session data (user info from cookie)
 */
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No session found" },
        { status: 401 }
      );
    }

    // Return session info (token is in httpOnly cookie, so we just confirm it exists)
    return NextResponse.json({
      authenticated: true,
      hasToken: true,
    });
  } catch (error) {
    console.error("Error in GET /api/auth/session:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to get session",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/session
 * Updates session data
 * Currently used to sync user data during migration
 * Note: Token is stored in httpOnly cookie and cannot be updated from client
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No session found" },
        { status: 401 }
      );
    }

    const { userData } = await req.json();

    // Session update is mainly for logging/syncing during migration
    // The actual token is in httpOnly cookie and managed by login route
    // User data is fetched from backend on demand via /api/auth/user

    return NextResponse.json({
      success: true,
      message: "Session updated",
    });
  } catch (error) {
    console.error("Error in POST /api/auth/session:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to update session",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Clears the session by removing the auth_token cookie
 */
export async function DELETE(req) {
  try {
    // Clear the auth_token cookie
    const cookie = serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return NextResponse.json(
      { success: true, message: "Session cleared" },
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch (error) {
    console.error("Error in DELETE /api/auth/session:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to clear session",
      },
      { status: 500 }
    );
  }
}


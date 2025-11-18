import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Apis from "@/components/apis/Apis";

/**
 * GET /api/auth/verify
 * Verifies if the user is authenticated by checking the auth_token cookie
 * Returns 200 if authenticated, 401 if not
 */
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "No token found" },
        { status: 401 }
      );
    }

    // Verify token by making a lightweight request to backend
    // We can use a simple endpoint like getProfileData to verify
    const response = await fetch(Apis.getProfileData, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return NextResponse.json({ authenticated: true }, { status: 200 });
    }

    // Token is invalid or expired
    return NextResponse.json(
      { authenticated: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error in /api/auth/verify:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Apis from "@/components/apis/Apis";

/**
 * GET /api/auth/user
 * Returns current user data from httpOnly cookie
 * This route reads the auth_token from cookies and fetches user profile from backend
 */
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token found" },
        { status: 401 }
      );
    }

    // Fetch user profile from backend API
    const response = await fetch(Apis.getProfileData, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If token is invalid, return 401
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Invalid or expired token" },
          { status: 401 }
        );
      }

      // Other errors
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: "Failed to fetch user",
          message: errorData.message || "Failed to fetch user profile",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.status === true && data.data) {
      // Return user data in the same format as localStorage
      // This maintains compatibility with existing code
      return NextResponse.json({
        token,
        user: data.data,
      });
    }

    return NextResponse.json(
      { error: "Invalid response", message: "Invalid user data format" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in /api/auth/user:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch user data",
      },
      { status: 500 }
    );
  }
}


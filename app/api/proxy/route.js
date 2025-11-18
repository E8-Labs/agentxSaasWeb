import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/proxy
 * Generic proxy route for backend API calls
 * Reads auth_token from httpOnly cookie and forwards requests to backend
 * 
 * Request body:
 * {
 *   url: string,           // Backend API URL
 *   method: string,        // HTTP method (GET, POST, PUT, DELETE, etc.)
 *   headers: object,       // Additional headers
 *   body: any,            // Request body
 *   params: object        // Query parameters
 * }
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token found" },
        { status: 401 }
      );
    }

    // Parse request body
    const { url, method = "GET", headers = {}, body, params } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Bad Request", message: "URL is required" },
        { status: 400 }
      );
    }

    // Build URL with query parameters if provided
    let requestUrl = url;
    if (params && Object.keys(params).length > 0) {
      const urlObj = new URL(url);
      Object.entries(params).forEach(([key, value]) => {
        if (value != null) {
          urlObj.searchParams.set(key, String(value));
        }
      });
      requestUrl = urlObj.toString();
    }

    // Prepare headers
    const requestHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...headers,
    };

    // Prepare fetch options
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: requestHeaders,
    };

    // Add body for methods that support it
    if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    // Forward request to backend
    const response = await fetch(requestUrl, fetchOptions);

    // Get response data
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Return response with same status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Error in /api/proxy:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message || "Failed to proxy request",
      },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { serialize } from "cookie";
import Apis from "@/components/apis/Apis";

export async function POST(req) {
  try {
    const { phone, verificationCode, timeZone } = await req.json();
    const phoneNumber = phone;
    // Validate input
    if (!phoneNumber || !verificationCode) {
      return NextResponse.json(
        {
          error: "Missing credentials",
          message: "Missing credentials",
          status: false,
          data: null,k
        },
        { status: 400 }
      );
    }

    // Call backend authentication API
    const response = await fetch(Apis.LogIn, {
      method: "POST",
      body: JSON.stringify({
        phone: phoneNumber,
        verificationCode: verificationCode,
        timeZone: timeZone,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data);
    }

    // Check if login was successful and token exists
    if (data.status === true && data.data && data.data.token) {
      // Securely store JWT token in a httpOnly cookie
      const tokenCookie = serialize("auth_token", data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Set-Cookie": tokenCookie },
      });
    }

    // If no token in response, return data without setting cookie
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: "Internal Server Error",
        status: false,
      },
      { status: 500 }
    );
  }
}

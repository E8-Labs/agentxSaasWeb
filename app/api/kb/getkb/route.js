import Apis from "@/components/apis/Apis";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Extract token from request headers (sent from the frontend)
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    // Extract batchId from the request URL query parameters
    const { searchParams } = new URL(req.url);
    const offset = searchParams.get("offset");
    const search = searchParams.get("search");

    // Fetch admin stats from backend API
    let url = Apis.GetKnowledgebase + `?offset=${offset}`;
    if (search && search.length > 0) {
      url = `${url}&search=${search}`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || "Failed to fetch kb ",
          status: false,
          data: null,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: "Internal server error" },
      { status: 500 }
    );
  }
}

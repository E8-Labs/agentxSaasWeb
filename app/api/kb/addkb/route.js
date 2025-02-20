import Apis from "@/components/apis/Apis";
import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false, // Required for multipart form-data
  },
};

export async function POST(req) {
  try {
    console.log("✅ API Route Hit - Processing Request");

    // Extract token from request headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Unauthorized Request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // ✅ Use `request.formData()` to handle FormData in App Router
    const formData = await req.formData();

    // Extract fields
    const type = formData.get("type");
    const documentName = formData.get("documentName");
    const title = formData.get("title");
    const originalContent = formData.get("originalContent");
    const media = formData.get("media"); // This will be a File object

    const formDataApi = new FormData();
    formDataApi.append("type", type);
    formDataApi.append("title", title);
    formDataApi.append("documentName", documentName);
    formDataApi.append("originalContent", originalContent);
    if (media) {
      console.log("Media found in server function ", media);
      formDataApi.append("media", media);
    }

    console.log("📥 Received Data:", { type, title, originalContent, media });

    // Validate required fields
    if (!type) {
      console.log("❌ Missing Required Fields");
      return NextResponse.json(
        { message: "Missing required parameters", status: false },
        { status: 400 }
      );
    }

    // If there is a file, handle it
    let uploadedFilePath = null;
    // if (media && media instanceof File) {
    //   const arrayBuffer = await media.arrayBuffer();
    //   const buffer = Buffer.from(arrayBuffer);

    //   console.log("✅ File Received:", media.name, "Size:", buffer.length);

    //   // Example: You could upload the file to S3, store it in a DB, etc.
    //   uploadedFilePath = `/uploads/${media.name}`;
    // }

    // ✅ Forward data to external API (if needed)
    const externalApiResponse = await fetch(Apis.AddKnowledgebase, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-Type": "application/json",
      },
      body: formDataApi,
    });

    const externalData = await externalApiResponse.json();
    console.log("📩 External API Response:", externalData);

    return NextResponse.json({ message: "Success", data: externalData });
  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// app/api/ghl/calendars/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
    const cookieStore = await cookies();
    const token = cookieStore.get("ghl_access_token")?.value;

    console.log("[calendars] hit", new Date().toISOString());
    console.log("[calendars] hasToken?", Boolean(token));

    if (!token) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const qLoc = searchParams.get("locationId");
    const cLoc = cookieStore.get("ghl_location_id")?.value;
    const locationId = qLoc || cLoc || "";

    const url = new URL("https://services.leadconnectorhq.com/calendars/");
    if (locationId) url.searchParams.set("locationId", cLoc);

    console.log("[calendars] requesting ->", url.toString());

    const r = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Version: "2021-07-28",
            Accept: "application/json",
        },
        cache: "no-store",
    });

    const text = await r.text();
    console.log("[calendars] upstream status:", r);
    if (!r.ok) console.log("[calendars] upstream body:", text);

    return new NextResponse(text, {
        status: r.ok ? 200 : r.status,
        headers: { "Content-Type": r.headers.get("content-type") || "application/json" },
    });
}

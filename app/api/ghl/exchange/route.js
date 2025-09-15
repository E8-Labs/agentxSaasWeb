// export async function GET(req) {
//     const { searchParams } = new URL(req.url);
//     const code = searchParams.get("code");
//     if (!code) {
//         return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
//     }

//     const body = new URLSearchParams({
//         grant_type: "authorization_code",
//         code,
//         client_id: process.env.GHL_CLIENT_ID,
//         client_secret: process.env.GHL_CLIENT_SECRET,
//         redirect_uri: process.env.GHL_REDIRECT_URI,
//     });

//     const r = await fetch("https://services.leadconnectorhq.com/oauth/token", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Accept: "application/json",
//             Version: "2021-07-28",
//         },
//         body,
//     });

//     const json = await r.json();
//     if (!r.ok) {
//         return new Response(JSON.stringify(json), { status: r.status });
//     }

//     // TODO: persist per-location (json.locationId) with access_token/refresh_token/expiry
//     return new Response(JSON.stringify(json), { status: 200 });
// }

// app/api/ghl/exchange/route.js
// import { NextResponse } from "next/server";

// export async function GET(req) {
//     const { searchParams } = new URL(req.url);
//     const code = searchParams.get("code");
//     if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

//     const body = new URLSearchParams({
//         grant_type: "authorization_code",
//         code,
//         client_id: process.env.GHL_CLIENT_ID,
//         client_secret: process.env.GHL_CLIENT_SECRET,
//         redirect_uri: process.env.GHL_REDIRECT_URI,
//     });

//     const r = await fetch("https://services.leadconnectorhq.com/oauth/token", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Accept: "application/json",
//             Version: "2021-07-28",
//         },
//         body,
//     });

//     const json = await r.json();
//     if (!r.ok) return NextResponse.json(json, { status: r.status });

//     const res = NextResponse.json({ ok: true });
//     const maxAge = Math.max(60, (json.expires_in ?? 3600) - 60);
//     const isProd = false;//process.env.NODE_ENV === "production";

//     res.cookies.set("ghl_access_token", json.access_token, {
//         httpOnly: true,
//         secure: isProd,           // ✅ only Secure in production
//         sameSite: "lax",
//         path: "/",
//         maxAge,
//     });

//     if (json.refresh_token) {
//         res.cookies.set("ghl_refresh_token", json.refresh_token, {
//             httpOnly: true,
//             secure: isProd,         // ✅ same here
//             sameSite: "lax",
//             path: "/",
//             maxAge: 60 * 60 * 24 * 30,
//         });
//     }

//     return res;
// }

// app/api/ghl/exchange/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const redirectUri = searchParams.get("redirect_uri") ?? "";//process.env.NEXT_PUBLIC_GHL_REDIRECT_URI
    console.log("Redirect url of GHL calendar is", redirectUri);
    const code = searchParams.get("code");
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    if (!redirectUri) return NextResponse.json({ error: "Missing redirect url" }, { status: 400 });

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_GHL_CLIENT_SECRET,
        redirect_uri: redirectUri,
        // redirect_uri: process.env.GHL_REDIRECT_URI,
    });

    const r = await fetch("https://services.leadconnectorhq.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", Version: "2021-07-28" },
        body,
    });

    const json = await r.json();
    console.log("R of GHL Auth api in json is", json)
    console.log("R of GHL Auth api simple is", r)
    if (!r.ok) return NextResponse.json(json, { status: r.status });

    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ ok: true, locationId: json.locationId ?? null }); // return locationId for UI
    const maxAge = Math.max(60, (json.expires_in ?? 3600) - 60);

    res.cookies.set("ghl_access_token", json.access_token, {
        httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge,
    });
    if (json.refresh_token) {
        res.cookies.set("ghl_refresh_token", json.refresh_token, {
            httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
        });
    }
    if (json.locationId) {
        res.cookies.set("ghl_location_id", json.locationId, {
            httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge,
        });
    }

    return res;
}


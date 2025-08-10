// app/api/getCookies/route.js
import { cookies } from "next/headers";

export const dynamic = "force-dynamic"; // optional, avoids caching

export async function GET() {
    const cookieStore = cookies();

    // HttpOnly cookies (can't be read in client JS)
    const accessToken = cookieStore.get("ghl_access_token")?.value;
    const refreshToken = cookieStore.get("ghl_refresh_token")?.value;

    // ⚠️ Don't send sensitive tokens to the client
    return Response.json({ accessToken, refreshToken });
}

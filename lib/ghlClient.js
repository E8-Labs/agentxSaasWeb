// lib/ghlClient.js
const BASE = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";

export async function ghlFetch(path, accessToken, { query } = {}) {
    const url = new URL(path.startsWith("http") ? path : `${BASE}${path}`);
    if (query) Object.entries(query).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: API_VERSION,
            Accept: "application/json",
        },
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return res.json();
}

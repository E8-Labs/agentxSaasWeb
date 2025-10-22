"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export default function AddGHLBtn() {
    const [status, setStatus] = useState(null);
    const [tokens, setTokens] = useState(null);
    const [calendars, setCalendars] = useState([]);
    const popupRef = useRef(null);

    // If we are the popup landing back at "/" with ?code=..., send it to the opener, then close.
    useEffect(() => {
        const qs = new URLSearchParams(window.location.search);
        const code = qs.get("code");
        const error = qs.get("error");

        // If this window was opened by another window (popup case)
        if (window.opener && (code || error)) {
            try {
                window.opener.postMessage(
                    { type: "GHL_OAUTH_CODE", code, error },
                    window.origin // only our own origin
                );
            } finally {
                window.close();
            }
            return; // Don't run the rest in the popup
        }
    }, []);

    // Main window: listen for the popup's message
    useEffect(() => {
        function onMessage(e) {
            // Security: ensure it came from our own origin
            if (e.origin !== window.location.origin) return;
            const { type, code, error } = e.data || {};
            if (type !== "GHL_OAUTH_CODE") return;

            if (error) {
                setStatus(`OAuth error: ${error}`);
                return;
            }
            if (!code) return;

            // Got the code from the popup → exchange on server
            (async () => {
                setStatus("Exchanging code...");
                const res = await fetch(`/api/ghl/exchange?code=${encodeURIComponent(code)}`);
                const json = await res.json();
                if (!res.ok) {
                    setStatus("Exchange failed");
                    console.error(json);
                    return;
                }
                // setStatus("Connected!");
                setTokens(json);
                // setStatus("Connected! Loading calendars...");
                // const calRes = await fetch("/api/ghl/calendars");
                // const calendars = await calRes.json();
                // if (!calRes.ok) {
                //   setStatus("Failed to load calendars");
                //   console.log(calendars);
                // } else {
                //   setStatus(`Loaded ${calendars?.calendars?.length ?? calendars?.length ?? 0} calendars`);
                //   setTokens(calendars); // or keep separate state like setCalendars(calendars)
                // }

                setStatus("Connected! Loading locations...");
                // const locRes = await fetch("/api/ghl/locations");
                // if (!locRes.ok) {
                //   setStatus(`Failed to load locations (${locRes.status})`);
                //   console.error(await locRes.text());
                //   return;
                // }
                // const locs = await locRes.json();
                // const locationId = locs?.locations?.[0]?.id; // pick one or show a selector
                // const locationId = cookieStore.get("ghl_location_id")?.value;
                // if (!locationId) {
                //   setStatus("No locations found for this token");
                //   return;
                // }else{
                // console.log("Location id fetched is", locationId);
                // }

                setStatus("Loading calendars...");
                const calRes = await fetch(`/api/ghl/calendars/`);//?locationId=${encodeURIComponent(locationId)}
                if (!calRes.ok) {
                    setStatus(`Failed to load calendars (${calRes.status})`);
                    console.error(await calRes.text());
                    return;
                }
                const calendars = await calRes.json();
                console.log("Calendars fetched are", calendars);
                setStatus(`Loaded ${calendars?.calendars?.length ?? calendars?.length ?? 0} calendars`);
                // setTokens(calendars); // or setCalendars(calendars)
                setCalendars(calendars.calendars);

            })();
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    const startAuthPopup = useCallback(() => {
        // Build scopes as a space-separated string
        const scope =
            (process.env.NEXT_PUBLIC_GHL_SCOPE || "").trim() ||
            [
                "calendars.readonly",
                "calendars/events.readonly",
                "calendars/resources.readonly",
                "contacts.readonly",
                "lc-email.readonly",
                "locations.readonly",
                "locations/customFields.readonly",
            ].join(" ");

        const params = new URLSearchParams({
            response_type: "code",
            client_id: process.env.NEXT_PUBLIC_GHL_CLIENT_ID ?? "",
            redirect_uri: process.env.NEXT_PUBLIC_GHL_REDIRECT_URI ?? "",
            scope,
            // keep auth in the same popup window
            loginWindowOpenMode: "self",
        });

        const authUrl =
            "https://marketplace.gohighlevel.com/oauth/chooselocation?" + params.toString();

        // Open a centered popup
        const w = 520;
        const h = 650;
        const y = window.top.outerHeight / 2 + window.top.screenY - h / 2;
        const x = window.top.outerWidth / 2 + window.top.screenX - w / 2;

        popupRef.current = window.open(
            authUrl,
            "ghl_oauth",
            `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h},top=${y},left=${x}`
        );

        if (!popupRef.current) {
            // Popup blocked → fallback to full redirect
            window.location.href = authUrl;
        } else {
            setStatus("Waiting for authorization...");
            // Optional: poll if user closes popup without completing
            const timer = setInterval(() => {
                if (popupRef.current && popupRef.current.closed) {
                    clearInterval(timer);
                    setStatus((prev) =>
                        prev === "Waiting for authorization..." ? "Popup closed" : prev
                    );
                }
            }, 500);
        }
    }, []);

    return (
        <main style={{ padding: 24 }}>
            <h1>GHL OAuth (Popup)</h1>

            <button
                onClick={startAuthPopup}
                style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                Connect GHL (Popup)
            </button>

            {status && <p style={{ marginTop: 12 }}>{status}</p>}

            {tokens && (
                <pre style={{ marginTop: 16, maxWidth: 800, overflow: "auto" }}>
                    {JSON.stringify(tokens, null, 2)}
                </pre>
            )}

            {
                calendars.length > 0 && (
                    <div>
                        {
                            calendars.map((item, index) => {
                                return (
                                    <div key={index}>
                                        {item.consentLabel}
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }
        </main>
    );
}

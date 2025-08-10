// components/GhlOauthWatcher.jsx
"use client";
import { useEffect } from "react";

export default function GhlOauthWatcher() {
    useEffect(() => {
        const qs = new URLSearchParams(window.location.search);
        const code = qs.get("code");
        const error = qs.get("error");
        const state = qs.get("state");

        if (window.opener && (code || error)) {
            try {
                window.opener.postMessage(
                    { type: "GHL_OAUTH_CODE", code, error, state },
                    window.location.origin
                );
            } finally {
                window.close();
            }
        }
    }, []);

    return null;
}

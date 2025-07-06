import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
    const token = await getToken({ req });

    if (!token || !token.accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const response = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
                headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                },
            }
        );

        const data = await response.json();

        res.status(200).json({
            userId: token.userId, // ✅ Return the Google user ID
            events: data.items || [],
        });
    } catch (error) {
        console.error("Calendar API error:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
}

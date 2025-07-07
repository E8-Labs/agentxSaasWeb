export default async function handler(req, res) {
  const { code } = req.query;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.NEXT_PUBLIC_APP_GOOGLE_CLIENT_APP_SECRET,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_REDIRECT_URI}`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await response.json();

  if (tokens.error) {
    return res.status(500).json({ error: tokens.error_description });
  }

  res.status(200).json({ tokens });
}

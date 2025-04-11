// pages/connect-stripe.tsx
"use client"
import { useState } from "react";
import axios from "axios";

export default function Page() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    const {
      data: { accountId },
    } = await axios.post("/api/stripe/create-account", {
      email: "test@example.com",
    });
    const {
      data: { url },
    } = await axios.post("/api/stripe/account-link", { accountId });
    window.location.href = url;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 text-blue-800">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
      >
        {loading ? "Redirecting..." : "Connect with Stripe"}
      </button>
    </div>
  );
}

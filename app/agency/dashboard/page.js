// pages/dashboard.tsx
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-green-800">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">You're All Set!</h1>
        <p className="mb-6">
          Stripe onboarding completed successfully. Welcome to your dashboard.
        </p>
        <Link href="/agency/dashboard">
          <label className="hover:bg-purple-500/80 text-white px-4 py-2 rounded-xl bg-purple transition">
            Go to Home
          </label>
        </Link>
      </div>
    </div>
  );
}

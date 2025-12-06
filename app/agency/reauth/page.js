// pages/reauth.tsx
import Link from 'next/link'

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Onboarding Incomplete</h1>
        <p className="mb-6">
          Looks like your Stripe onboarding was canceled or didn’t finish.
        </p>
        <Link href="/connect-stripe">
          <a className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition">
            Try Again
          </a>
        </Link>
      </div>
    </div>
  )
}

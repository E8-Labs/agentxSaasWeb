'use client'

import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'

import Creator from '@/components/voiceaicall/Creator'

const Page = () => {
  const params = useParams() // e.g., /web-agent/[id]
  const searchParams = useSearchParams()

  // Guard: useParams() can be undefined in Next.js 16 (e.g. before hydration / RSC)
  const modelId = params?.id ?? null
  const name = searchParams?.get?.('name') ?? null
  const shareToken = searchParams?.get?.('share') ?? null

  if (modelId == null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    )
  }

  return (
    <div>
      <Creator agentId={modelId} name={name} shareToken={shareToken} />
    </div>
  )
}

export default Page

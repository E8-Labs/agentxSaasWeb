'use client'

import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'

import Creator from '@/components/voiceaicall/Creator'

const Page = () => {
  // const params = useParams();
  // // const id = params.id;
  // const modelId = params.modelId;
  // const name = params.name;
  const params = useParams() // e.g., /web-agent/[id]
  const searchParams = useSearchParams() // query string from URL

  const modelId = params.id // assuming your file is [id]/page.js
  const name = searchParams.get('name') // pulls ?name=value from the URL
  const shareToken = searchParams.get('share') // shared link: resolve to thread and show form only if lead info missing

  return (
    <div>
      <Creator agentId={modelId} name={name} shareToken={shareToken} />
    </div>
  )
}

export default Page

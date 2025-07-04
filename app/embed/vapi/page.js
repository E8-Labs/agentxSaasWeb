// app/embed/vapi/page.jsx or page.tsx
"use client";
import React, { Suspense } from 'react'
import EmbedVapi from './EmbedVapi';

function Page() {
  return (
    <div style={{ backgroundColor: "#ffffff01" }}>
      <Suspense>
        <EmbedVapi />
      </Suspense>
    </div>
  )
}

export default Page

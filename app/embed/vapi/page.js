// app/embed/vapi/page.jsx or page.tsx
"use client";
import React, { Suspense } from 'react'
import EmbedVapi from './EmbedVapi';

function Page() {
  return (
   <Suspense>
    <EmbedVapi/>
   </Suspense>
  )
}

export default Page

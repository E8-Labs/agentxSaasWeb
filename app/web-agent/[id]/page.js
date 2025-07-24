"use client"
import Creator from '@/components/voiceaicall/Creator'
import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'

const Page = () => {

    // const params = useParams();
    // // const id = params.id;
    // const modelId = params.modelId;
    // const name = params.name;
    const params = useParams(); // e.g., /web-agent/[id]
    const searchParams = useSearchParams(); // query string from URL

    const modelId = params.id; // assuming your file is [id]/page.js
    const name = searchParams.get("name"); // pulls ?name=value from the URL

    console.log("modelId:", modelId);
    console.log("name:", name);

    return (
        <div>
            <Creator agentId={modelId} name={name} />
        </div>
    )
}

export default Page

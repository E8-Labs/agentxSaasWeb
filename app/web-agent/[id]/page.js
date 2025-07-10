"use client"
import Creator from '@/components/voiceaicall/Creator'
import { useParams } from 'next/navigation'
import React from 'react'

const Page = () => {

    const params = useParams();
    const id = params.id;

    return (
        <div>
            <Creator agentId={id} />
        </div>
    )
}

export default Page

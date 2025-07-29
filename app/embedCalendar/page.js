"use client"
import Image from 'next/image';
import Script from 'next/script';
import React from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    return (
        <div className='w-full h-[100svh] flex flex-col items-center justify-between'>
            <div className='w-11/12 h-[90%] bg-white'>
                <div className='flex items-center justify-center mt-6'>
                    <Image
                        src={'/agentXOrb.gif'}
                        alt='orb'
                        width={80}
                        height={80}
                    />
                </div>
                {/*
                    <div className="self-stretch text-center justify-center text-black text-xl font-semibold font-['Inter'] leading-relaxed">Join the AI Workshop</div>
                */}
                <div style={{ fontWeight: "600", fontSize: 28 }} className="text-center mt-2">Join the AI Workshop</div>
                <div className='text-center mt-2 w-11/12' style={{ fontSize: 16, fontWeight: "500" }}>
                    Get the most out of your AI agents and learn hands on during this 1hr workshop.
                    Limited to 10 people per slot.
                </div>
                <div
                    className="w-full h-[50svh] bg-zinc-100 rounded-xl mt-10 flex flex-col items-center pt-6"
                >
                    <iframe 
                        src="https://set.myagentx.com/widget/booking/xrSWkBaX7ATaR7bGnyPb" 
                        style={{ width: "90%", border: "none", overflow: "hidden" }} 
                        id="xrSWkBaX7ATaR7bGnyPb_1753725547631"
                    />
                    <Script 
                        src="https://set.myagentx.com/js/form_embed.js" 
                        strategy="lazyOnload"
                    />
                </div>
            </div>
            <div className='w-full mb-4'>
                <button className='w-full h-12 bg-purple text-white rounded-xl'
                    onClick={() => {
                        // router.push('/createagent');
                        window.location.href = "/createagent";
                    }}>
                    Continue
                </button>
            </div>
        </div>
    )
}

export default Page

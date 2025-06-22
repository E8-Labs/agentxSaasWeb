import { ArrowLeftIcon } from '@phosphor-icons/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

const TwilioProfile = () => {

    const router = useRouter();
    const pathname = usePathname();

    const links = [
        {
            id: 1,
            title: "Customer Profile",
            img: "/twiliohubassets/profile.jpg",
            href: "/twiliohub",
            width: 18,
            height: 21
        },
        {
            id: 2,
            title: "CNAM",
            img: "/twiliohubassets/cnam.jpg",
            href: "/cnam",
            width: 20,
            height: 20
        },
        {
            id: 3,
            title: "SHAKEN/STIR Calling",
            img: "/twiliohubassets/stir.jpg",
            href: "",
            width: 21,
            height: 21
        },
        {
            id: 4,
            title: "Voice Integrity",
            img: "/twiliohubassets/voiceintegrity.jpg",
            href: "",
            height: 18,
            width: 18
        },
        {
            id: 5,
            title: "Branded Calls",
            img: "/twiliohubassets/calls.jpg",
            href: "",
            width: 18,
            height: 18
        },
    ];

    const styles = {
        linkTxt: {
            fontWeight: "500",
            fontSize: 15,
            color: "white"
        }
    }

    return (
        <div className='w-full flex flex-col items-center h-screen'>
            <div className='w-[80%] mt-8'>
                <button className='outline-none border-none h-[50px] w-[120px] px-2 rounded-lg bg-[#ffffff30] flex flex-row items-center justify-center gap-2 text-white'>
                    <ArrowLeftIcon size={16} className="text-white" />
                    <p>
                        Back
                    </p>
                </button>
            </div>
            <div className='w-[80%] mt-16'>
                {
                    links.map((item) => {
                        return (
                            <button
                                key={item.id}
                                className='border-none mt-6 outline-none flex flex-row items-center gap-4 text-start'
                            >
                                <div className={`bg-[#ffffff30] h-[40px] w-[40px] rounded-full ${pathname === item.href ? "border border-2 border-whte" : "bordere-transparent outline-none"} flex flex-row items-center justify-center`}>
                                    <Image
                                        alt='*'
                                        src={item.img}
                                        height={item.height || 20}
                                        width={item.width || 20}
                                    />
                                </div>
                                <div
                                    style={styles.linkTxt}
                                    className={
                                        pathname === item.href ? "text-purple" : "text-white"
                                    }>
                                    {item.title}
                                </div>
                            </button>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default TwilioProfile

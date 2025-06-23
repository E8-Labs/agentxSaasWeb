import { ArrowLeftIcon } from '@phosphor-icons/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const TwilioProfile = () => {

    const router = useRouter();
    const pathname = usePathname();

    //prefetch the routes
    useEffect(() => {
        links.forEach((link) => {
            if (link.href) {
                router.prefetch(link.href);
            }
        });
    }, []);

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
            href: "/twiliohub/cnam",
            width: 20,
            height: 20
        },
        {
            id: 3,
            title: "SHAKEN/STIR Calling",
            img: "/twiliohubassets/stir.jpg",
            href: "/twiliohub/stirCalling",
            width: 21,
            height: 21
        },
        {
            id: 4,
            title: "Voice Integrity",
            img: "/twiliohubassets/voiceintegrity.jpg",
            href: "/twiliohub/twilioIntegrations",
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

    //styles
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
                    <Image
                        alt='*'
                        src={"/twiliohubAssets/arrowBack.jpg"}
                        height={14}
                        width={16}
                    />
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
                                onClick={() => {
                                    console.log(`Routing to ${item.href}`);
                                    router.push(item.href);
                                }}
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

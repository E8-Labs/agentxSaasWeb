import React, { useState } from 'react'
import Image from 'next/image'

function Support() {

    const [HoverAIWebinar, setHoverAIWebinar] = useState(false);
    const [hoverConsultation, setHoverConsultation] = useState(false);

    return (
        <div className='w-full flex flex-col items-start px-8 py-2' style={{ paddingBottom: '50px', height: '100%', overflow: 'auto', scrollbarWidth: 'none' }}>

            <div style={{ fontSize: 22, fontWeight: "700", color: '#000' }}>
                Support
            </div>

            <div style={{ fontSize: 12, fontWeight: "500", color: '#00000090' }}>
                {"Account > Support"}
            </div>

            <div
                style={{
                    alignSelf: 'center', cursor: "pointer"
                }}
                className='w-8/12 hover:bg-purple border rounded p-4 mt-10'
                onMouseEnter={() => { setHoverAIWebinar(true) }}
                onMouseLeave={() => { setHoverAIWebinar(false) }}
            >
                <div className='flex flex-row gap-2'>
                    {/* <Image src={'/otherAssets/calenderIcon.png'}
                        alt='calender'
                        height={24}
                        width={24}
                    /> */}
                    {
                        HoverAIWebinar ? (
                            <Image
                                src={"/assets/whiteCalenderIcon.svg"}
                                alt="calender"
                                height={24}
                                width={24}
                            />
                        ) : (
                            <Image
                                src={"/svgIcons/calenderIcon.svg"}
                                alt="calender"
                                height={24}
                                width={24}
                            />
                        )
                    }
                    <div
                        style={{
                            fontSize: 16, fontWeight: '500', color: HoverAIWebinar ? "white" : '#7902DF'
                        }}>
                        Join our weekly AI Webinar
                    </div>

                </div>
                <div
                    style={{
                        fontSize: 14, fontWeight: '400', marginTop: '1vh',
                        color: HoverAIWebinar ? "white" : ""
                    }}>
                    {`Learn tips and tricks to enhance your AI, perfect your script, and master best practices in our weekly live webinar. Don’t miss out on actionable insights to boost your success!`}
                </div>
            </div>

            <div
                className='w-8/12 hover:bg-purple border rounded p-4 mt-10'
                style={{ alignSelf: 'center', cursor: "pointer" }}
                onMouseEnter={() => { setHoverConsultation(true) }}
                onMouseLeave={() => { setHoverConsultation(false) }}
            >
                <div className='flex flex-row gap-2'>
                    {
                        hoverConsultation ? (
                            <Image
                                src={"/svgIcons/screenIcon.svg"}
                                alt="calender"
                                height={24}
                                width={24}
                            />
                        ) : (
                            <Image
                                src={"/assets/blueScreenIcon.svg"}
                                alt="calender"
                                height={24}
                                width={24}
                            />
                        )
                    }
                    <div
                        style={{
                            fontSize: 16, fontWeight: '500', color: hoverConsultation ? '#fff' : "#7902DF",
                        }}>
                        Schedule a one on one consultation
                    </div>

                </div>
                <div style={{ fontSize: 14, fontWeight: '400', marginTop: '1vh', color: hoverConsultation ? '#fff' : "" }}>
                    Schedule a personalized one-on-one consultation for just
                    $99/hour. Get expert guidance to refine your AI,
                    customize your script, and achieve your goals with
                    tailored advice!
                </div>
            </div>

        </div>

    )
}

export default Support
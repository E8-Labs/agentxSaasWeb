import Image from 'next/image'
import React from 'react'

function TwillioUpgradeView() {
    return (
        <div className='flex flex-col items-center h-full'>
            <div className='flex flex-col items-start w-full p-6'>
                <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
                    Twilio Trust Hub
                </div>
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#00000090",
                    }}
                >
                    {"Account > Twilio"}
                </div>
            </div>
            <div className="w-[90%]  mt-8 flex h-[40vh] bg-white shadow-lg flex-col items-center justify-center gap-5">
                <Image
                    src={"/otherAssets/starsIcon2.png"}
                    height={24} width={24} alt='*'
                />

                <div className='text-lg font-semibold '>
                    Enable Twilio
                </div>

                <div className='text-base font-normal text-center'>
                    Import your Twilio phone numbers and access all <br/> Trust Hub features to increase answer rate.
                </div>

                <button
                    className='px-6 py-3 rounded-lg bg-purple text-base font-semibold text-white'
                >
                    Upgrade
                </button>
            </div>
        </div>
    )
}

export default TwillioUpgradeView
"use client"
import Image from 'next/image';
import React, { useState } from 'react'

const Cnammain = () => {

    const [agreeTerms, setAgreeTerms] = useState(false);

    //toggle agree terms click
    const handleToggleTermsClick = () => {
        setAgreeTerms(!agreeTerms);
    };

    //stylles
    const styles = {
        normalTxt: {
            fontWeight: "500",
            fontSize: 15
        }
    }

    return (
        <div className='h-[100%] w-full flex flex-col items-center justify-between'>
            <div className='w-6/12 max-h-[80%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2'>
                <div className='mt-8' style={{ fontWeight: "700", fontSize: 22 }}>
                    CNAM
                </div>
                <div
                    className='mt-2'
                    style={{ fontWeight: "700", fontSize: 17 }}>
                    {`Enter a display name for CNAM`}
                </div>
                <div className='mt-2' style={styles.normalTxt}>
                    This name will show on your customers phone when you call them. You can display uptill 15 characters. The display name will be vetted for appropriateness and relevance to your Business.
                </div>
                <div
                    className='mt-4'
                    style={styles.normalTxt}>
                    CNAM display name*
                </div>
                <div className='w-full mt-2'>
                    <input
                        className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                        style={styles.normalTxt}
                        placeholder='Name'
                    />
                </div>
                <div className='flex flex-row items-start gap-2 px-4 py-2 rounded-lg bg-[#00000005] mt-4'>
                    <button onClick={handleToggleTermsClick}>
                        {agreeTerms ? (
                            <div
                                className="bg-purple flex flex-row items-center justify-center rounded"
                                style={{ height: "24px", width: "24px" }}
                            >
                                <Image
                                    src={"/assets/whiteTick.png"}
                                    height={8}
                                    width={10}
                                    alt="*"
                                />
                            </div>
                        ) : (
                            <div
                                className="bg-none border-2 flex flex-row items-center justify-center rounded"
                                style={{ height: "24px", width: "24px" }}
                            ></div>
                        )}
                    </button>
                    <div style={{
                        fontWeight: "400",
                        fontSize: 13
                    }}>
                        {`I certify that the associated Business profile is the originator of the phone calls and certify that the display name represents my business`}
                    </div>
                </div>
            </div>
            <div className='w-8/12 pb-12 max-h-[20%] flex flex-row items-center justify-between'>
                <button className='outline-none border-none text-purple' style={styles.normalTxt}>
                    Save&Exit
                </button>
                <button className='h-[50px] w-[170px] text-white text-center rounded-lg bg-purple'>
                    Continue
                </button>
            </div>
        </div>
    )
}

export default Cnammain

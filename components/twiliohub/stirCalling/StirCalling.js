import Image from 'next/image';
import React, { useState } from 'react'

const StirCalling = () => {

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
                    SHAKEN/STIR Calling
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
                    className='mt-6'
                    style={styles.normalTxt}>
                    Trust product name*
                </div>
                <div className='w-full mt-2'>
                    <input
                        className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                        style={styles.normalTxt}
                        placeholder='Trust product name'
                    />
                </div>
                <div
                    className='pt-4 mt-6 w-full'
                    style={{
                        fontWeight: "700",
                        fontSize: 18,
                        borderTop: "2px solid #00000010"
                    }}>
                    Select a Business Profile
                </div>
                <div
                    className='mt-2'
                    style={{
                        fontWeight: "400",
                        fontSize: 13,
                        color: "#00000060"
                    }}>
                    {`We will enable SHAKEN/STIR for outbound calls on all united States numbers assigned to this Twilio Approved Business Profile. No additional configuration is required. Enabling SHAKEN/STIR Trusted calling will not interupt your existing services`}
                </div>
                <div className='w-full mt-2'>
                    <input
                        className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                        style={styles.normalTxt}
                        placeholder='Trust product name'
                    />
                </div>
                <div
                    className='pt-2 mt-6 w-full'
                    style={{
                        fontWeight: "700",
                        fontSize: 18,
                        borderTop: "2px solid #00000010"
                    }}>
                    Register Phone Number to SHAKEN/STIR Trust Product
                </div>
                <div
                    className='mt-2'
                    style={styles.normalTxt}>
                    Select phone numbers on your Twilio Approved Business Profile and assign them to this SHAKEN/STIR Trust Product.
                </div>
                <button className='border-none outline-none rounded-lg h-[50px] w-[236px] flex flex-row items-center justify-center mt-4 text-purple bg-purple10'>
                    Register Phone Numbers
                </button>
                <div className='flex flex-row items-start gap-2 mt-4 bg-[#00000005] p-2 rounded-lg'>
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
                    <div style={styles.normalTxt} className="text-sm leading-snug text-black">
                        {`I certify that the associated Business Profile is the originator of the phone calls and certify that I will participate in traceback efforts, including those initiated by the`}
                        <a
                            href="https://www.atis.org/sti-pa/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple underline"
                        >
                            Secure Telephony Identity Policy Administrator (STI-PA)
                        </a>
                        {` and `}
                        <a
                            href="https://www.ustelecom.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple underline"
                        >
                            US telecom
                        </a>
                    </div>

                </div>
            </div>
            <div className='w-10/12 pb-12 max-h-[20%] flex flex-row items-center justify-between'>
                <button className='outline-none border-none text-purple' style={styles.normalTxt}>
                    Back
                </button>
                <button className='h-[50px] w-[170px] text-white text-center rounded-lg bg-purple'>
                    Continue
                </button>
            </div>
        </div>
    )
}

export default StirCalling

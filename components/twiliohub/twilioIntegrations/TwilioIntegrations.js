import Image from 'next/image'
import React from 'react'

const TwilioIntegrations = () => {

    //stylles
    const styles = {
        normalTxt: {
            fontWeight: "500",
            fontSize: 15
        },
        regular: {
            fontWeight: "500",
            fontSize: 15,
        },
    }

    return (
        <div className='h-[100%] w-full flex flex-col items-center justify-between'>
            <div className='w-8/12 max-h-[80%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2'>
                <div className='mt-6' style={{ fontWeight: "700", fontSize: 22 }}>
                    New Voice Integrity Registration
                </div>
                <div
                    className='mt-6'
                    style={styles.normalTxt}>
                    Voice integrity friendly name*
                </div>
                <div className='w-full mt-2'>
                    <input
                        className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                        style={styles.normalTxt}
                        placeholder='Voice integrity friendly name*'
                    />
                </div>
                <div
                    className='pt-4 mt-4 w-full'
                    style={{
                        fontWeight: "700",
                        fontSize: 18,
                        borderTop: "2px solid #00000010"
                    }}>
                    Company Information
                </div>
                <div
                    className='mt-2'
                    style={{ ...styles.regular, color: "#00000060" }}>
                    This information may be sent to analytic vendors to register your numbers.
                </div>
                <div
                    className='mt-4'
                    style={styles.normalTxt}>
                    {`Company size (Number of employeees)*`}
                </div>
                <div className='w-full mt-2'>
                    <input
                        className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                        inputMode="numeric"
                        type='number'
                        pattern="[0-9]*"
                        style={styles.normalTxt}
                        placeholder='Enter numbers only'
                    />
                    <div className='flex flex-row items-center gap-2 mt-2'>
                        <Image
                            alt='*'
                            src={"/twiliohubassets/errorInfo.jpg"}
                            height={15}
                            width={15}
                        />
                        <div className='text-red' style={styles.regular}>
                            Please enter a numerical value greate than 0
                        </div>
                    </div>
                </div>
                <div
                    className='mt-4'
                    style={styles.normalTxt}>
                    {`Average calls per day*`}
                </div>
                <div className='w-full mt-2'>
                    <input
                        className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                        inputMode="numeric"
                        type='number'
                        pattern="[0-9]*"
                        style={styles.normalTxt}
                        placeholder='Enter numbers only'
                    />
                    <div className='flex flex-row items-center gap-2 mt-2'>
                        <Image
                            alt='*'
                            src={"/twiliohubassets/errorInfo.jpg"}
                            height={15}
                            width={15}
                        />
                        <div className='text-red' style={styles.regular}>
                            Please enter a numerical value greate than 0
                        </div>
                    </div>
                </div>
                <div className='p-2 rounded-lg bg-[#00000005] mt-6'>
                    {`Twilio will approve your voice integrity registration based on the status of the associated business profile and submit these numbers to Verizon, AT&T, and T-Mobile. Carrier registration for active spam monitoring can take up to 48hrs. You’ll receive an email when the status is updated`}
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

export default TwilioIntegrations

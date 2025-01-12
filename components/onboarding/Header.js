import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Header = ({ skipSellerKYC, buyerKYC, shouldContinue, showSkip, handleContinue }) => {

    const router = useRouter();

    return (
        <div>
            <div className='px-4 flex flex-row items-center md:pt-2'>
                <div className='w-4/12'>
                    <Image className='ms-6 hidden md:flex' src="/assets/agentX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' />
                </div>
                <div className='w-4/12 flex flex-row justify-center'>
                    <Image className='' src="/agentXOrb.gif" style={{ height: "69px", width: "75px", resize: "contain" }} height={69} width={69} alt='*' />
                </div>
                <div className='w-4/12 flex felx-row items-start h-full justify-end'>
                    {
                        skipSellerKYC && shouldContinue && (
                            <button
                                className='underline h-full me-8'
                                style={{
                                    fontSize: 15,
                                    fontWeight: "600",
                                    color: "#00000060"
                                }}
                                onClick={() => { router.push("/buyerskycquestions"); }}>
                                Skip
                            </button>
                        )
                    }
                    {
                        buyerKYC && shouldContinue && (
                            <button
                                className='underline h-full me-8'
                                style={{
                                    fontSize: 15,
                                    fontWeight: "600",
                                    color: "#00000060"
                                }} onClick={() => { router.push("/pipeline"); }}>
                                Skip
                            </button>
                        )
                    }
                    {
                        showSkip && shouldContinue && (
                            <button
                                className='underline h-full me-8'
                                style={{
                                    fontSize: 15,
                                    fontWeight: "600",
                                    color: "#00000060"
                                }} onClick={handleContinue}>
                                Skip
                            </button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Header
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Congrats = () => {

    const router = useRouter();

    const handleNext = () => {
        router.push("/createagent");
    }

    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-white rounded-2xl w-10/12 max-h-[90vh] py-4 pb-22 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
                <div className='px-4 flex flex-row justify-between items-center pt-8'>
                    <Image src="/assets/agentX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' />
                </div>
                {/* Body */}
                <div className='flex flex-col items-center px-4 w-full'>
                    <div className='mt-6 md:text-4xl text-lg font-[600]' style={{ textAlign: "center" }}>
                        Congrats!
                    </div>
                    <div className='mt-8 gap-4 flex flex-col max-h-[50vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
                        <Image src={"/assets/congrats.png"} style={{ height: "318px", width: "466px", resize: "contain" }} height={318} width={466} alt='*' />
                    </div>
                    <div className='mt-1 text-[#15151580]' style={{ fontWeight: "600", fontSize: 15 }}>
                        Your account is created!
                    </div>
                    <div className='mt-1 text-[#151515]' style={{ fontWeight: "600", fontSize: 16 }}>
                        {`Let's build your AI AgentX`}
                    </div>
                    <button className='rounded-xl text-white bg-purple mt-8' style={{ fontWeight: "700", fontSize: "16", height: "50px", width: "191px" }} onClick={handleNext}>
                        Build  AI AgentX
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Congrats

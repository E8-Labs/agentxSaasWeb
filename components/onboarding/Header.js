import React from 'react';
import Image from 'next/image';

const Header = () => {
    return (
        <div>
            <div className='px-4 flex flex-row items-center pt-8'>
                <div className='w-4/12'>
                    <Image src="/assets/agentX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' />
                </div>
                <div className='w-4/12 flex flex-row justify-center'>
                    <Image className='hidden md:flex' src="/assets/colorCircle.png" style={{ height: "69px", width: "69px", resize: "contain" }} height={69} width={69} alt='*' />
                </div>
                <div className='w-4/12'>

                </div>
            </div>
        </div>
    )
}

export default Header
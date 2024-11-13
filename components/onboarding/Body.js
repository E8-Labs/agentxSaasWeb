import Image from 'next/image'
import React from 'react'

const Body = () => {
    return (
        <div>
            <div className='border-2 flex flex-row items-start justify-between px-4 rounded-lg py-2'>
                <div>
                    <div>
                        Name
                    </div>
                    <div>
                        Detail
                    </div>
                </div>
                <button className=''>
                    <Image src={"/assets/charmTick.png"} alt='*' height={36} width={36} />
                </button>
            </div>
        </div>
    )
}

export default Body
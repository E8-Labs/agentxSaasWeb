import Image from 'next/image'
import React from 'react'

const CloseBtn = ({ onClick }) => {
    return (
        <div>
            <button
                className='cursor-pointer px-3 py-3 rounded-full bg-[#00000010]'
                onClick={onClick}
            >
                <Image src="/assets/cross.png" alt="close" width={15} height={15} />
            </button>
        </div>
    )
}

export default CloseBtn

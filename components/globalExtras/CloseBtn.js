import Image from 'next/image'
import React from 'react'

const CloseBtn = ({ onClick, showWhiteCross }) => {
    return (
        <div>
            <button
                className='cursor-pointer px-3 py-3 rounded-full bg-[#00000010]'
                onClick={onClick}
            >
                <Image
                    alt="close"
                    src="/assets/cross.png"
                    width={15} height={15}
                    style={{ filter: showWhiteCross ? "invert(1)" : "invert(0)" }}
                />
            </button>
        </div>
    )
}

export default CloseBtn

export const CloseBtn2 = ({ onClick }) => {
    return (
        <div>
            <button
                className="outline-none"
                onClick={onClick}
            >
                <Image
                    src={"/assets/blackBgCross.png"}
                    height={20}
                    width={20}
                    alt="*"
                />
            </button>
        </div>
    )
}

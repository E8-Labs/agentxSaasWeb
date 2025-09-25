import Image from 'next/image'
import React from 'react'

const CloseBtn = ({ onClick, showWhiteCross }) => {
    return (
        <div>
            <button
                className='cursor-pointer px-2 py-2 rounded-full bg-[#00000010]'
                onClick={onClick}
            >
                <Image
                    src={"/assets/crossIcon.png"}
                    height={10}
                    width={10}
                    alt="*"
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

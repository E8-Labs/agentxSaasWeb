import Image from 'next/image'
import React from 'react'

const CloseBtn = ({ onClick, showWhiteCross, className = '', ...props }) => {
  return (
    <div>
      <button
        className={`cursor-pointer px-2 py-2 rounded-full bg-transparent ${className}`}
        onClick={onClick}
        {...props}
      >
        <Image
          alt="close"
          src="/assets/cross.png"
          width={15}
          height={15}
          style={{ filter: showWhiteCross ? 'invert(1)' : 'invert(0)' }}
        />
      </button>
    </div>
  )
}

export default CloseBtn

export const CloseBtn2 = ({ onClick }) => {
  return (
    <div>
      <button className="outline-none" onClick={onClick}>
        <Image
          src={'/assets/blackBgCross.png'}
          height={20}
          width={20}
          alt="*"
        />
      </button>
    </div>
  )
}

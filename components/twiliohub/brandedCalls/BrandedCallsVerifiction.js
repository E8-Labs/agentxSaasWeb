import React, { useEffect, useState } from 'react'

import BrandedCallsHeader from './BrandedCallsHeader'

const BrandedCallsVerifiction = ({ handleBack, handleContinue }) => {
  const [verificationCode, setVerificationCode] = useState('')
  const [canContinue, setCanContinue] = useState(true)

  useEffect(() => {
    if (!verificationCode) {
      setCanContinue(true)
    } else {
      setCanContinue(false)
    }
  }, [verificationCode])

  const styles = {
    boldFont: {
      fontSize: 22,
      fontWeight: '700',
    },
    regularFont: {
      fontSize: 15,
      fontWeight: '500',
    },
    semiBold: {
      fontSize: 18,
      fontWeight: '700',
    },
    smallTxt: {
      fontSize: 13,
      fontWeight: '400',
      color: '#00000060',
    },
  }

  return (
    <div className="h-[100%] w-full flex flex-col items-center justify-between">
      <div className="w-11/12 h-[90%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2">
        <BrandedCallsHeader />
        <div
          style={styles.semiBold}
          className="mt-3 pt-6 border-t-[2px] border-[#00000010]"
        >
          Confirm your email address
        </div>
        <div className="mt-4" style={styles.regularFont}>
          {`We sent a 5 digit confirmation code to this <<email address>>`}
        </div>
        <div className="w-full mt-2">
          <input
            className="border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0"
            style={styles.regularFont}
            placeholder="Confirmation code"
            value={verificationCode}
            type="number"
            onChange={(e) => {
              setVerificationCode(e.target.value)
            }}
          />
        </div>
        <i style={styles.smallTxt} className="mt-2">
          Please not that this code will be valid for 10 minutes
        </i>
      </div>
      <div className="w-full max-h-[10%] flex flex-row items-center justify-between">
        <button
          className="outline-none border-none text-purple"
          style={styles.regularFont}
          // onClick={() => {
          //     handleBack()
          // }}
        >
          Back
        </button>
        <button
          className={`h-[50px] w-[170px] text-center rounded-lg ${canContinue ? 'bg-[#00000040] text-black' : 'text-white bg-purple'}`}
          disabled={canContinue}
          onClick={() => {
            handleContinue()
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default BrandedCallsVerifiction

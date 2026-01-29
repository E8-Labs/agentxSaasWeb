import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

import { logout } from '@/utilities/UserUtility'
import { renderBrandedIcon } from '@/utilities/iconMasking'

function CancelationCompleted({ handleContinue }) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center w-full -mt-5">
      <div className="flex flex-row items-center justify-center">
       {renderBrandedIcon('/otherAssets/checkMark.png',48,48)}
      </div>

      <div className="text-xl font-semibold mt-4">Cancellation Complete</div>

      <div className="text-base font-normal mt-4">
        {`We’ve shut things down on our end. Sad to see you go, but we’re proud to have supported you along the way.`}
      </div>

      <button
        className="flex flex-col items-center justify-center h-[50px] w-full bg-brand-primary rounded-lg text-base font-normal text-white mt-5 "
        onClick={() => {
          let nextAction = 'closeModel'
          handleContinue(nextAction)
        }}
      >
        Done
      </button>
    </div>
  )
}

export default CancelationCompleted

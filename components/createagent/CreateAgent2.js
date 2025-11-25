import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Body from '@/components/onboarding/Body'
import Footer from '@/components/onboarding/Footer'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'

const CreateAgent2 = ({ handleContinue, handleBack }) => {
  const router = useRouter()
  const [toggleClick, setToggleClick] = useState(false)
  const handleToggleClick = (id) => {
    setToggleClick((prevId) => (prevId === id ? null : id))
  }

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: '700',
    },
    gitTextStyle: {
      fontSize: 15,
      fontWeight: '700',
    },
  }

  return (
    <div
      style={{ width: '100%' }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <div className="bg-white rounded-2xl w-10/12 h-[90vh] py-4 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-brand-primary">
        {/* header */}
        <Header />
        {/* Body */}
        <div className="flex flex-col items-center px-4 w-full">
          <div
            className="mt-6 w-11/12 sm:text-4xl text-lg font-[700]"
            style={{ textAlign: 'center' }}
          >
            Our gift to you
          </div>
          <div className="mt-2 sm:text-[29px]" style={{ fontWeight: '400' }}>
            Your first 30 minutes are on us!
          </div>
          <div
            className="flex flex-row items-center gap-2 text-brand-primary mt-6"
            style={styles.gitTextStyle}
          >
            <Image src={'/svgIcons/gift.svg'} height={22} width={22} alt="*" />
            Enjoy your next calls on us
          </div>
          <Image
            className=""
            src={'/assets/30.png'}
            height={350}
            width={280}
            alt="*"
          />
          <button
            className="rounded-lg text-white bg-brand-primary"
            style={{
              fontWeight: '700',
              fontSize: '16',
              height: '50px',
              width: '340px',
            }}
            onClick={handleContinue}
          >
            Claim the gift
          </button>
        </div>
        {/* <div>
                    <ProgressBar value={33} />
                </div> */}

        {/* <Footer handleContinue={handleContinue} /> */}
      </div>
    </div>
  )
}

export default CreateAgent2

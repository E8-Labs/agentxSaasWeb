import React, { useEffect, useState } from 'react'

import BrandedCallsHeader from './BrandedCallsHeader'

const BrandInfo = ({ handleBack, handleContinue }) => {
  const [businessName, setBusinessName] = useState('')
  const [integritySID, setIntegritySID] = useState('')
  const [brandDisplayName, setBrandDisplayName] = useState('')
  const [longBrandDisplayName, setLongBrandDisplayName] = useState('')
  const [useCaseInfo, setUseCaseInfo] = useState('')

  const [canContinue, setCanContinue] = useState(true)

  useEffect(() => {
    if (
      !businessName ||
      !integritySID ||
      !brandDisplayName ||
      !longBrandDisplayName ||
      useCaseInfo
    ) {
      setCanContinue(true)
    } else {
      setCanContinue(false)
    }
  }, [
    businessName,
    integritySID,
    brandDisplayName,
    longBrandDisplayName,
    useCaseInfo,
  ])

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
      <div className="w-full h-[90%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2">
        <BrandedCallsHeader />
        <div
          style={styles.semiBold}
          className="mt-3 pt-6 border-t-[2px] border-[#00000010]"
        >
          Brand Information
        </div>
        <div className="mt-4" style={styles.regularFont}>
          What is your legal Business name?
        </div>
        <div className="w-full mt-2">
          <input
            className="border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0"
            style={styles.regularFont}
            placeholder="Business name"
            value={businessName}
            type="number"
            onChange={(e) => {
              setBusinessName(e.target.value)
            }}
          />
        </div>
        <div className="mt-4" style={styles.regularFont}>
          What is the Voice Integrity Bundle SID?
        </div>
        <div className="w-full mt-2">
          <input
            className="border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0"
            style={styles.regularFont}
            placeholder="BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={integritySID}
            type="number"
            onChange={(e) => {
              setIntegritySID(e.target.value)
            }}
          />
        </div>
        <div className="mt-4" style={styles.regularFont}>
          Brand display name
        </div>
        <div className="w-full mt-2">
          <input
            className="border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0"
            style={styles.regularFont}
            placeholder="Brand display name"
            value={brandDisplayName}
            type="number"
            onChange={(e) => {
              setBrandDisplayName(e.target.value)
            }}
          />
        </div>
        <i className="mt-6" style={styles.smallTxt}>
          This will be the default display name on outgoing calls. Limited to 15
          alphanumeric characters and cannot contain any special characters. The
          brand display name must match the registered comapny name or DBA of
          the business
        </i>
        <div className="mt-4" style={styles.regularFont}>
          Long brand display name
        </div>
        <div className="w-full mt-2">
          <input
            className="border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0"
            style={styles.regularFont}
            placeholder="Long brand display name"
            value={longBrandDisplayName}
            type="number"
            onChange={(e) => {
              setLongBrandDisplayName(e.target.value)
            }}
          />
        </div>
        <i className="mt-6" style={styles.smallTxt}>
          {`Limited to 32 alphanumeric characters. Long and Short Display Names need to match (e.g one cannot be the business legal name and the other one brand name). The long display name is only used on T-Mobile. Leave blank if you want the same display name on all carriers`}
        </i>
        <div
          style={styles.semiBold}
          className="mt-8 pt-6 border-t-[2px] border-[#00000010]"
        >
          use case information
        </div>
        <div className="mt-4" style={styles.regularFont}>
          Please describe the purpose of your outbound calls
        </div>
        <textarea
          rows={4}
          placeholder="Type here"
          className="mt-2 w-full rounded-lg"
          value={useCaseInfo}
          onChange={(e) => {
            setUseCaseInfo(e.target.value)
          }}
        />
        <i className="mt-2" style={styles.smallTxt}>
          Example: We are a hospital provider. After our patients are discharged
          from the hospital we need to follow up wit them within 48 hours. We
          are calling them as part of the out patient care process.
        </i>
      </div>
      <div className="w-full max-h-[10%] flex flex-row items-center justify-between">
        <button
          className="outline-none border-none text-purple"
          style={styles.regularFont}
          onClick={() => {
            handleBack()
          }}
        >
          Back
        </button>
        <button
          className={`h-[50px] w-[170px] text-center rounded-lg ${!canContinue ? 'bg-[#00000040] text-black' : 'text-white bg-purple'}`}
          // disabled={canContinue}
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

export default BrandInfo

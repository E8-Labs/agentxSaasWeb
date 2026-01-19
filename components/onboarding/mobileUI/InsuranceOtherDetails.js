import React from 'react'

import { Input } from '@/components/ui/input'

function InsuranceOtherDetails({
  inputsFields,
  userFarm,
  setUserFarm,
  userBrokage,
  setUserBrokage,
  handleVerifyPopup,
}) {
  return (
    <div className="w-full">
      <div style={styles.headingStyle} className="mt-6">
        {`Market Territory `}
      </div>
      <Input
        ref={(el) => (inputsFields.current[0] = el)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        enterKeyHint="done"
        placeholder="Type here"
        className="border-[#00000010] focus:border-black focus-visible:border-black w-full mt-2"
        style={{ ...styles.inputStyle }}
        value={userFarm}
        onChange={(e) => {
          setUserFarm(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Done') {
            inputsFields.current[1]?.focus() // Move to the second input
          }
        }}
      />

      <div style={styles.headingStyle} className="mt-6">
        Agency or Brokerage Name
      </div>
      <Input
        ref={(el) => (inputsFields.current[1] = el)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        enterKeyHint="done"
        placeholder="Type here"
        className="border-[#00000010] focus:border-black focus-visible:border-black w-full mt-2"
        style={{ ...styles.inputStyle }}
        value={userBrokage}
        onChange={(e) => {
          setUserBrokage(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Done') {
            handleVerifyPopup()
          }
        }}
      />
    </div>
  )
}

export default InsuranceOtherDetails

const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputStyle: {
    fontSize: 15,
    fontWeight: '500',
    borderRadius: '7px',
  },
  errmsg: {
    fontSize: 12,
    fontWeight: '500',
    borderRadius: '7px',
  },
  verifyPopup: {
    height: 'auto',
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-55%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}

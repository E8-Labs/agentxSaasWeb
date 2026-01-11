import React from 'react'

import { Input } from '@/components/ui/input'

function MedSpaAgentOtherDetails({
  customerService,
  setCustomerService,
  companyName,
  setCompanyName,
  installationVolume,
  setInstallationVolume,
}) {
  return (
    <div className="w-full">
      <div style={styles.headingStyle} className="mt-6">
        Where do you primarily operate?
      </div>
      <Input
        placeholder="Specific cities, counties, or regions"
        className="border-[#00000010] focus:border-black focus-visible:border-black w-full mt-2"
        style={{ ...styles.inputStyle }}
        value={customerService}
        onChange={(e) => {
          setCustomerService(e.target.value)
        }}
      />

      <div style={styles.headingStyle} className="mt-6">
        Name of the med spa or practice you work with, if any.
      </div>
      <Input
        placeholder="Name"
        className="border-[#00000010] focus:border-black focus-visible:border-black w-full mt-2"
        style={{ ...styles.inputStyle }}
        value={companyName}
        onChange={(e) => {
          setCompanyName(e.target.value)
        }}
      />

      <div style={styles.headingStyle} className="mt-6">
        How many clients do you typically see per month?
      </div>
      <Input
        placeholder="Type here"
        className="border-[#00000010] focus:border-black focus-visible:border-black w-full mt-2"
        style={{ ...styles.inputStyle }}
        value={installationVolume}
        onChange={(e) => {
          setInstallationVolume(e.target.value)
        }}
        type="number"
      />
    </div>
  )
}

export default MedSpaAgentOtherDetails

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

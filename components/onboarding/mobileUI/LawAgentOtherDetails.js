import React from 'react'

import { Input } from '@/components/ui/input'

function LawAgentOtherDetails({
  customerService,
  setCustomerService,
  companyName,
  setCompanyName,
  installationVolume,
  setInstallationVolume,
  ClientType,
  handleSelectClientType,
  consultation,
  handleConsultationFormat,
}) {
  const primaryClientTypes = [
    {
      id: 1,
      title: 'Individuals (B2)',
    },
    {
      id: 2,
      title: 'Businesses & Corporations (B2B)',
    },
    {
      id: 3,
      title: 'Government & Public Sector',
    },
  ]

  const ConsultationFormat = [
    {
      id: 1,
      title: 'In-Person Consultations',
    },
    {
      id: 2,
      title: 'Virtual Consultations',
    },
  ]
  return (
    <div className='w-full'>
      <div style={styles.headingStyle} className="mt-6">
        Where do you primarily practice law?
      </div>
      <Input
        placeholder="Type here"
        className="border-[#00000010] focus:border-black focus-visible:border-black w-full mt-2"
        style={{ ...styles.inputStyle }}
        value={customerService}
        onChange={(e) => {
          setCustomerService(e.target.value)
        }}
      />

      <div style={styles.headingStyle} className="mt-6">
        Name of the firm or legal practice you work with, if any.
      </div>
      <Input
        placeholder="Type here"
        className="border-[#00000010] focus:border-black focus-visible:border-black w-full mt-2"
        style={{ ...styles.inputStyle }}
        value={companyName}
        onChange={(e) => {
          setCompanyName(e.target.value)
        }}
      />

      <div style={styles.headingStyle} className="mt-6">
        How many cases do you handle annually or monthly?
      </div>
      <Input
        type="number"
        placeholder="Type here"
        className="border-[#00000010] focus:border-black focus-visible:border-black w-full mt-2"
        style={{ ...styles.inputStyle }}
        value={installationVolume}
        onChange={(e) => {
          setInstallationVolume(e.target.value)
        }}
      />

      <div style={styles.headingStyle} className="mt-6">
        Client Type
      </div>

      <div
        className="flex w-full flex-col items-center gap-2"
        style={{ marginTop: '8px', flexWrap: 'wrap' }}
      >
        {primaryClientTypes.map((item, index) => {
          return (
            <div key={index} className="w-full">
              <button
                onClick={() => {
                  handleSelectClientType(item)
                }}
                className="border items-start w-full flex flex-row border-[#00000010] rounded px-4 py-4 outline-none focus:outline-none focus:ring-0"
                style={{
                  borderRadius: '30px',
                  paddingInline: index === 2 && '40px',
                  border: ClientType === item.title ? '2px solid #7902DF' : '',
                  backgroundColor: ClientType === item.title ? '#402FFF20' : '',
                }}
              >
                {item.title}
              </button>
            </div>
          )
        })}
      </div>

      <div style={styles.headingStyle} className="mt-6">
        Consultation Format
      </div>

      <div
        className="flex w-full flex-wrap flex-row items-center gap-2"
        style={{ marginTop: '8px' }}
      >
        {ConsultationFormat.map((item, index) => {
          return (
            <div key={index} className="w-full">
              <button
                onClick={() => {
                  handleConsultationFormat(item)
                }}
                className="border border-[#00000010] rounded px-4 py-4 outline-none focus:outline-none focus:ring-0"
                style={{
                  borderRadius: '30px',
                  paddingInline: index === 2 && '40px',
                  border:
                    consultation === item.title ? '2px solid #7902DF' : '',
                  backgroundColor:
                    consultation === item.title ? '#402FFF20' : '',
                }}
              >
                {item.title}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LawAgentOtherDetails

const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputStyle: {
    fontSize: 15,
    fontWeight: '500',
    borderRadius: '7px',
    width: '100%',
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

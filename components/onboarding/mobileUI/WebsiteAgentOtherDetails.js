import React, { useEffect, useState } from 'react'

import { isValidUrl } from '@/constants/Constants'
import { Input } from '@/components/ui/input'

function WebsiteAgentOtherDetails({
  websiteUrl,
  setWebsiteUrl,
  urlErrorMessage,
  setUrlErrorMessage,
}) {
  useEffect(() => {
    let timer = setTimeout(() => {
      //console.log);
      if (websiteUrl) {
        if (isValidUrl(websiteUrl)) {
          setUrlErrorMessage('')
          //console.log;
        } else {
          setUrlErrorMessage('Invalid')
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [websiteUrl])

  return (
    <div className="w-full">
      <div style={styles.headingStyle} className="mt-6">
        Website (URL)
      </div>
      <div>
        {urlErrorMessage && (
          <p
            style={{
              ...styles.errmsg,
              color: 'red',
              textAlign: 'right',
            }}
          >
            {urlErrorMessage}
          </p>
        )}
      </div>

      <Input
        placeholder="URL"
        className="border-[#00000010] focus:border-black focus-visible:border-black w-full mb-2 mt-2"
        style={{ ...styles.inputStyle }}
        value={websiteUrl}
        onChange={(e) => {
          setWebsiteUrl(e.target.value)
          setUrlErrorMessage('')
        }}
      />
    </div>
  )
}

export default WebsiteAgentOtherDetails

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

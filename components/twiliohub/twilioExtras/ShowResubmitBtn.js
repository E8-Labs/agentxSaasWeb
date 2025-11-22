import React, { useEffect, useState } from 'react'

const ShowResubmitBtn = ({ status, handleOpenModal }) => {
  const [showResubMitBtn, setShowResubmitBtn] = useState(false)

  useEffect(() => {
    console.log('Status passed to resubmit is', status)
    if (status === 'twilio-rejected') {
      //rejected
      setShowResubmitBtn(true)
    } else {
      setShowResubmitBtn(false)
    }
  }, [])

  return (
    <div>
      {showResubMitBtn && (
        <button
          className="text-purple"
          style={{ fontWeight: '500', fontSize: 15 }}
          onClick={handleOpenModal}
        >
          Resubmit
        </button>
      )}
    </div>
  )
}

export default ShowResubmitBtn

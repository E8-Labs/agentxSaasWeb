import React from 'react'

import AgentSelectSnackMessage from '@/components/dashboard/leads/AgentSelectSnackMessage'

const TwilioSnackBar = ({ showSnack, setShowSnack }) => {
  return (
    <AgentSelectSnackMessage
      type={showSnack.type}
      message={showSnack.message}
      isVisible={showSnack.isVisible}
      hide={() => {
        setShowSnack({
          message: '',
          isVisible: false,
          type: SnackbarTypes.Success,
        })
      }}
    />
  )
}

export default TwilioSnackBar

import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const EditAgentName = ({
  showRenameAgentPopup,
  handleClose,
  agentNamePassed,
  renameAgentLoader,
  handleEditAgentName,
}) => {
  //input
  const [renameAgent, setRenameAgent] = useState('')

  useEffect(() => {
    if (agentNamePassed) {
      setRenameAgent(agentNamePassed)
    }
  }, [agentNamePassed])

  //styles list
  const styles = {
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  return (
    <Modal
      open={showRenameAgentPopup}
      onClose={() => {
        handleClose()
      }}
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: '#00000020',
          // //backdropFilter: "blur(20px)",
        },
      }}
    >
      <Box
        className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
        sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
      >
        <div style={{ width: '100%' }}>
          <div
            className="max-h-[60vh] overflow-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            <div
              style={{
                width: '100%',
                direction: 'row',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* <div style={{ width: "20%" }} /> */}
              <div style={{ fontWeight: '700', fontSize: 22 }}>
                Rename Agent
              </div>
              <div
                style={{
                  direction: 'row',
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <button
                  onClick={() => {
                    handleClose()
                  }}
                  className="outline-none"
                >
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
            </div>

            <div>
              <div
                className="mt-4"
                style={{ fontWeight: '600', fontSize: 12, paddingBottom: 5 }}
              >
                Agent Name
              </div>
              <input
                value={renameAgent || ''}
                // value = {showRenameAgentPopup?.name}
                onChange={(e) => {
                  setRenameAgent(e.target.value)
                }}
                placeholder={
                  'Enter agent title'
                  // selectedRenameAgent?.name
                  //   ? selectedRenameAgent.name
                  //   : "Enter agent title"
                }
                className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                style={{ border: '1px solid #00000020' }}
              />
            </div>
          </div>

          {renameAgentLoader ? (
            <div className="flex flex-row iems-center justify-center w-full mt-4">
              <CircularProgress size={25} />
            </div>
          ) : (
            <button
              className="mt-4 outline-none bg-brand-primary text-white"
              style={{
                height: '50px',
                borderRadius: '10px',
                width: '100%',
                fontWeight: 600,
                fontSize: '20',
              }}
              onClick={handleEditAgentName}
            >
              Update
            </button>
          )}
        </div>
      </Box>
    </Modal>
  )
}

export default EditAgentName

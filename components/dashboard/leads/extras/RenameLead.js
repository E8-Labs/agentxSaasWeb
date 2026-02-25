import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const RenameLead = ({
  showRenameLeadPopup,
  handleClose,
  leadNamePassed,
  renameLeadLoader,
  handleRenameLead,
  overlayZIndex = 9999, // elevated (e.g. 5020) when opened from drawer; normal pages use 9999
}) => {
  //input
  const [renameLead, setRenameLead] = useState('')

  useEffect(() => {
    if (leadNamePassed) {
      setRenameLead(leadNamePassed)
    }
  }, [leadNamePassed])

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
      open={showRenameLeadPopup}
      onClose={() => {
        handleClose()
      }}
      slotProps={{
        root: {
          style: {
            zIndex: overlayZIndex,
          },
        },
      }}
      sx={{ zIndex: overlayZIndex }}
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: '#00000020',
          zIndex: overlayZIndex,
        },
      }}
    >
      <Box
        className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
        sx={{ ...styles.modalsStyle, backgroundColor: 'white', zIndex: overlayZIndex, position: 'relative' }}
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
                Rename Lead
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
                Lead Name
              </div>
              <input
                value={renameLead || ''}
                // value = {showRenameLeadPopup?.name}
                onChange={(e) => {
                  setRenameLead(e.target.value)
                }}
                placeholder={
                  'Enter lead title'
                  // selectedRenameLead?.name
                  //   ? selectedRenameLead.name
                  //   : "Enter lead title"
                }
                className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                style={{ border: '1px solid #00000020' }}
              />
            </div>
          </div>

          {renameLeadLoader ? (
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
              onClick={() => handleRenameLead(renameLead)}
            >
              Update
            </button>
          )}
        </div>
      </Box>
    </Modal>
  )
}

export default RenameLead

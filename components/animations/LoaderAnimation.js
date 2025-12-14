import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React from 'react'

import { AgentXOrb } from '@/components/common/AgentXOrb'

const LoaderAnimation = ({
  loaderModal,
  isOpen,
  title = 'Your agent is building..',
}) => {
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
    modalsStyle: {
      height: 'auto',
      // bgcolor: "transparent",
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      border: 'none',
      outline: 'none',
    },
  }

  return (
    <div>
      <Modal
        open={loaderModal || isOpen}
        // onClose={() => loaderModal(false)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box
          className="lg:w-4/12 sm:w-7/12 w-8/12 rounded-3xl bg-white"
          sx={styles.modalsStyle}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full"
              style={{
                backgroundColor: 'transparent',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row items-start mt-12 justify-center">
                {/* <CircularProgress size={200} thickness={1} /> */}
                <AgentXOrb
                  width={152}
                  height={142}
                  style={{ height: '142px', width: '152px', resize: 'contain' }}
                />
              </div>

              <div
                className="text-center mt-8"
                style={{ fontWeight: '600', fontSize: 16 }}
              >
                {title}
              </div>

              {/* <div className='text-center mt-6 pb-8' style={{ fontWeight: "400", fontSize: 15 }}>
                                Loading ...
                            </div> */}

              {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default LoaderAnimation

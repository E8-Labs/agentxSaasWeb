import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React from 'react'

import { cn } from '@/lib/utils'

const IntroVideoModal = ({
  open,
  onClose,
  videoTitle,
  videoUrl,
  videoDescription,
  showLoader = false,
  zIndex,
}) => {
  const modalStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <Modal
      open={open}
      sx={zIndex != null ? { zIndex } : undefined}
      onClose={() => {
        if (videoTitle === 'Welcome to AssignX') {
        } else {
          onClose()
        }
      }}
      closeAfterTransition
      BackdropProps={{
        timeout: 250,
        sx: {
          backgroundColor: '#00000099',
        },
      }}
    >
      <Box
        className="flex min-h-[500px] w-[700px] max-w-[90vw] flex-col overflow-hidden rounded-[12px] border border-border bg-background shadow-[0_4px_36px_rgba(0,0,0,0.25)]"
        sx={modalStyles}
      >
        <div className="flex w-full shrink-0 flex-row items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="min-w-0 flex-1 text-left text-base font-semibold leading-tight text-foreground">
            {videoTitle || 'Learn more about assigning leads'}
          </h2>
          <button
            type="button"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              'bg-muted text-foreground transition-colors duration-150 hover:bg-muted/80',
              'active:scale-[0.98]',
            )}
            onClick={onClose}
            aria-label="Close"
          >
            <Image
              src="/assets/crossIcon.png"
              height={24}
              width={24}
              alt=""
            />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4 py-4 text-sm leading-normal text-foreground/80">
          {videoDescription ? (
            <p className="mb-3 text-left">{videoDescription}</p>
          ) : null}

          <div className="flex min-h-0 flex-1 items-center overflow-hidden rounded-lg bg-black">
            {showLoader ? (
              <div className="flex w-full flex-row items-center justify-center py-16">
                <CircularProgress />
              </div>
            ) : (
              <video
                controls
                autoPlay
                muted={false}
                className="h-full max-h-[min(60vh,440px)] w-full object-contain"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default IntroVideoModal

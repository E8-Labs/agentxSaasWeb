import { Box, CircularProgress, Modal } from '@mui/material'
import React, { useEffect, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'

const VideoPlayerModal = ({
  open,
  onClose,
  videoTitle,
  videoUrl,
  videoDescription,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isYouTube, setIsYouTube] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')

  useEffect(() => {
    if (open && videoUrl) {
      setIsLoading(true)
      // Check if it's a YouTube URL
      const youtubeRegex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = videoUrl.match(youtubeRegex)

      if (match) {
        setIsYouTube(true)
        const videoId = match[1]
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`)
      } else {
        setIsYouTube(false)
        setEmbedUrl(videoUrl)
      }
      setIsLoading(false)
    } else if (!open) {
      // Reset when modal closes
      setIsLoading(true)
      setEmbedUrl('')
    }
  }, [videoUrl, open])

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
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 1000,
        sx: {
          backgroundColor: '#00000020',
          backdropFilter: 'blur(20px)',
        },
      }}
      sx={{
        zIndex: 1300,
      }}
    >
      <Box className="lg:w-5/12 sm:w-full w-8/12" sx={modalStyles}>
        <div
          className="sm:w-full w-full"
          style={{
            backgroundColor: '#ffffff',
            padding: 20,
            borderRadius: '13px',
          }}
        >
          {/* Close Button */}
          <div className="flex flex-row justify-end mb-4">
            <CloseBtn onClick={onClose} />
          </div>

          {/* Title */}
          <div
            className="text-center mb-2"
            style={{ fontWeight: '700', fontSize: 25 }}
          >
            {videoTitle || 'Tutorial Video'}
          </div>

          {videoDescription && (
            <div
              className="text-center mb-2"
              style={{ fontWeight: '600', fontSize: 18, color: '#616161' }}
            >
              {videoDescription}
            </div>
          )}

          {/* Video Section */}
          <div className="">
            {isLoading ? (
              <div className="w-full flex flex-row items-center justify-center mt-4">
                <CircularProgress />
              </div>
            ) : isYouTube ? (
              <iframe
                src={embedUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={videoTitle || 'YouTube video'}
                style={{
                  width: '100%',
                  height: '50vh',
                  minHeight: '400px',
                  borderRadius: 15,
                }}
              />
            ) : (
              <video
                controls
                autoPlay
                muted={false}
                style={{
                  width: '100%',
                  height: '50vh',
                  minHeight: '400px',
                  borderRadius: 15,
                }}
              >
                <source src={embedUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default VideoPlayerModal

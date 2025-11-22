import { Box, Modal } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'

const LogoCropper = ({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 3,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Debug logging
  useEffect(() => {
    console.log('🖼️ [LogoCropper] Props changed:', {
      open,
      hasImageSrc: !!imageSrc,
    })
  }, [open, imageSrc])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      setError(null)
    }
  }, [open])

  // Max dimensions for final cropped image (navbar display constraints)
  // Final image will be resized to fit within these while maintaining 4:1 aspect ratio
  const MAX_WIDTH = 120
  const MAX_HEIGHT = 32

  const onCropChange = useCallback((crop) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom)
  }, [])

  const onCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    // Calculate scale to fit max dimensions while maintaining aspect ratio
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const cropWidth = pixelCrop.width * scaleX
    const cropHeight = pixelCrop.height * scaleY

    // Calculate final dimensions maintaining aspect ratio
    let finalWidth = cropWidth
    let finalHeight = cropHeight

    // Scale down if exceeds max dimensions
    if (finalWidth > MAX_WIDTH) {
      const ratio = MAX_WIDTH / finalWidth
      finalWidth = MAX_WIDTH
      finalHeight = finalHeight * ratio
    }

    if (finalHeight > MAX_HEIGHT) {
      const ratio = MAX_HEIGHT / finalHeight
      finalHeight = MAX_HEIGHT
      finalWidth = finalWidth * ratio
    }

    canvas.width = finalWidth
    canvas.height = finalHeight

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      finalWidth,
      finalHeight,
    )

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null)
            return
          }
          blob.name = 'cropped-logo.png'
          const fileUrl = URL.createObjectURL(blob)
          resolve({ file: blob, url: fileUrl })
        },
        'image/png',
        0.95, // High quality
      )
    })
  }

  const handleCropComplete = async () => {
    if (!croppedAreaPixels) {
      setError('Please select a crop area')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)

      // Check file size (should be less than 512kb after cropping)
      if (croppedImage.file.size > 524288) {
        setError(
          'Cropped image is still too large. Please try a different crop area.',
        )
        setLoading(false)
        return
      }

      onCropComplete(croppedImage.file, croppedImage.url)
      onClose()
    } catch (err) {
      console.error('Error cropping image:', err)
      setError('Failed to crop image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  console.log(
    '🖼️ [LogoCropper] Rendering with open:',
    open,
    'imageSrc:',
    !!imageSrc,
  )

  return (
    <>
      <Modal
        open={open && !!imageSrc}
        onClose={onClose}
        aria-labelledby="logo-cropper-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '90%',
            maxWidth: '600px',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            outline: 'none',
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold">Crop Your Logo</div>
            <div className="text-sm text-gray-600">
              Recommended: 600 × 200 px upload. Final display: Max 120px width ×
              32px height (3:1 aspect ratio)
            </div>

            <div
              className="relative"
              style={{ width: '100%', height: '400px', background: '#333' }}
            >
              {imageSrc ? (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onCropAreaChange={onCropAreaChange}
                  style={{
                    containerStyle: {
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      background: '#333',
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Loading image...
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex flex-row justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Apply Crop'}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  )
}

export default LogoCropper

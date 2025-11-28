import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'

import LabelingHeader from './LabelingHeader'
import LogoCropper from './LogoCropper'
import UploadImageButton from './UploadImageButton'
import WhiteLAbelTooltTip from './WhiteLAbelTooltTip'

const BrandConfig = () => {
  //tool tip
  const Logo1Tip =
    'Recommended upload: 600 × 200 px (max 2MB). Final display: Max 120px width × 32px height. Logo will be cropped to fit.'
  const FaviconTip = 'Image should be maximum 512kb and should be square'

  const [logoPreview, setLogoPreview] = useState(null)
  const [faviconPreview, setFaviconPreview] = useState(null)
  const [primaryColor, setPrimaryColor] = useState('#C90202')
  const [secondaryColor, setSecondaryColor] = useState('#2302C9')

  // File states for uploads
  const [logoFile, setLogoFile] = useState(null)
  const [faviconFile, setFaviconFile] = useState(null)

  // Cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState(null)

  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showSnackMessage, setShowSnackMessage] = useState({
    type: SnackbarTypes.Error,
    message: '',
    isVisible: false,
  })

  // Original values for reset
  const [originalValues, setOriginalValues] = useState({
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#C90202',
    secondaryColor: '#2302C9',
  })

  // Fetch branding data on mount
  useEffect(() => {
    fetchBrandingData()
  }, [])

  const fetchBrandingData = async () => {
    try {
      setFetching(true)
      const localData = localStorage.getItem('User')
      let authToken = null

      if (localData) {
        const userData = JSON.parse(localData)
        authToken = userData.token
      }

      if (!authToken) {
        setShowSnackMessage({
          type: SnackbarTypes.Error,
          message: 'Authentication required',
          isVisible: true,
        })
        setFetching(false)
        return
      }

      const response = await axios.get(Apis.getAgencyBranding, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response?.data?.status === true && response?.data?.data) {
        const branding = response.data.data.branding || {}

        // Set form values
        setPrimaryColor(branding.primaryColor || '#C90202')
        setSecondaryColor(branding.secondaryColor || '#2302C9')

        // Set preview images if URLs exist
        if (branding.logoUrl) {
          setLogoPreview(branding.logoUrl)
        }
        if (branding.faviconUrl) {
          setFaviconPreview(branding.faviconUrl)
        }

        // Store original values
        setOriginalValues({
          logoUrl: branding.logoUrl || null,
          faviconUrl: branding.faviconUrl || null,
          primaryColor: branding.primaryColor || '#C90202',
          secondaryColor: branding.secondaryColor || '#2302C9',
        })
      }
    } catch (error) {
      console.error('Error fetching branding data:', error)
      // Don't show error if it's a 404 (no branding data yet)
      if (error.response?.status !== 404) {
        setShowSnackMessage({
          type: SnackbarTypes.Error,
          message:
            error.response?.data?.message || 'Failed to fetch branding data',
          isVisible: true,
        })
      }
    } finally {
      setFetching(false)
    }
  }

  //logo image selector
  const handleLogoUpload = (file) => {
    console.log('🖼️ [BrandConfig] Logo upload triggered', file)

    if (!file) {
      console.log('❌ [BrandConfig] No file provided')
      return
    }

    // Validate file size (2MB = 2097152 bytes for upload, will be cropped/resized)
    if (file.size > 2097152) {
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'Logo file size must be less than 2MB',
        isVisible: true,
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'Please upload a valid image file',
        isVisible: true,
      })
      return
    }

    // Read file and show cropper immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log('✅ [BrandConfig] File read successfully, opening cropper')
      const imageDataUrl = e.target.result

      // Set both states together - React will batch the updates
      setImageToCrop(imageDataUrl)
      // Use setTimeout to ensure state is set before opening modal
      setTimeout(() => {
        setShowCropper(true)
        console.log('🖼️ [BrandConfig] Cropper opened')
      }, 0)
    }
    reader.onerror = () => {
      console.error('❌ [BrandConfig] File read error')
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'Failed to read file. Please try again.',
        isVisible: true,
      })
    }
    reader.readAsDataURL(file)
  }

  // Handle cropped logo
  const handleCropComplete = (croppedFile, croppedUrl) => {
    setLogoFile(croppedFile)
    setLogoPreview(croppedUrl)
    setShowCropper(false)
    setImageToCrop(null)
  }

  //favicon image selector
  const handleFaviconUpload = (file) => {
    // Validate file size
    if (file.size > 524288) {
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'Favicon file size must be less than 512kb',
        isVisible: true,
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'Please upload a valid image file',
        isVisible: true,
      })
      return
    }

    setFaviconFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setFaviconPreview(reader.result)
    reader.readAsDataURL(file)
  }

  //primary color selector
  const handlePrimaryColorChange = (color) => {
    setPrimaryColor(color)
  }

  //secondary color selector
  const handleSecondaryColorChange = (color) => {
    setSecondaryColor(color)
  }

  // Check if there are any unsaved changes
  const hasChanges = () => {
    // Check if colors have changed
    const colorsChanged =
      primaryColor !== originalValues.primaryColor ||
      secondaryColor !== originalValues.secondaryColor

    // Check if logo has changed (new file selected or preview differs from original)
    const logoChanged =
      logoFile !== null ||
      (logoPreview !== originalValues.logoUrl &&
        logoPreview !== null &&
        originalValues.logoUrl !== null) ||
      (logoPreview !== null && originalValues.logoUrl === null) ||
      (logoPreview === null && originalValues.logoUrl !== null)

    // Check if favicon has changed (new file selected or preview differs from original)
    const faviconChanged =
      faviconFile !== null ||
      (faviconPreview !== originalValues.faviconUrl &&
        faviconPreview !== null &&
        originalValues.faviconUrl !== null) ||
      (faviconPreview !== null && originalValues.faviconUrl === null) ||
      (faviconPreview === null && originalValues.faviconUrl !== null)

    return colorsChanged || logoChanged || faviconChanged
  }

  //reset all the values to original
  const handleReset = () => {
    setPrimaryColor(originalValues.primaryColor)
    setSecondaryColor(originalValues.secondaryColor)
    setLogoPreview(originalValues.logoUrl)
    setFaviconPreview(originalValues.faviconUrl)
    setLogoFile(null)
    setFaviconFile(null)
  }

  // Upload logo file
  const uploadLogo = async (authToken) => {
    if (!logoFile) return null

    const formData = new FormData()
    formData.append('logo', logoFile)

    try {
      const response = await axios.post(Apis.uploadBrandingLogo, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response?.data?.status === true) {
        return response.data.data?.logoUrl || null
      }
      return null
    } catch (error) {
      console.error('Error uploading logo:', error)
      throw new Error(error.response?.data?.message || 'Failed to upload logo')
    }
  }

  // Upload favicon file
  const uploadFavicon = async (authToken) => {
    if (!faviconFile) return null

    const formData = new FormData()
    formData.append('favicon', faviconFile)

    try {
      const response = await axios.post(Apis.uploadBrandingFavicon, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response?.data?.status === true) {
        return response.data.data?.faviconUrl || null
      }
      return null
    } catch (error) {
      console.error('Error uploading favicon:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to upload favicon',
      )
    }
  }

  // Save all branding changes
  const handleSave = async () => {
    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      let authToken = null

      if (localData) {
        const userData = JSON.parse(localData)
        authToken = userData.token
      }

      if (!authToken) {
        setShowSnackMessage({
          type: SnackbarTypes.Error,
          message: 'Authentication required',
          isVisible: true,
        })
        setLoading(false)
        return
      }

      // Upload logo if new file selected
      let logoUrl = originalValues.logoUrl
      if (logoFile) {
        logoUrl = await uploadLogo(authToken)
        if (!logoUrl) {
          throw new Error('Failed to upload logo')
        }
      }

      // Upload favicon if new file selected
      let faviconUrl = originalValues.faviconUrl
      if (faviconFile) {
        faviconUrl = await uploadFavicon(authToken)
        if (!faviconUrl) {
          throw new Error('Failed to upload favicon')
        }
      }

      // Update colors if changed
      if (
        primaryColor !== originalValues.primaryColor ||
        secondaryColor !== originalValues.secondaryColor
      ) {
        const colorsData = {
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
        }

        await axios.put(Apis.updateAgencyBrandingColors, colorsData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
      }

      // Update original values with new data
      setOriginalValues({
        logoUrl: logoUrl || originalValues.logoUrl,
        faviconUrl: faviconUrl || originalValues.faviconUrl,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
      })

      // Clear file states
      setLogoFile(null)
      setFaviconFile(null)

      setShowSnackMessage({
        type: SnackbarTypes.Success,
        message: 'Branding settings saved successfully',
        isVisible: true,
      })

      // Refresh data to get latest from server
      await fetchBrandingData()

      // Update cookie and localStorage with new branding so login page shows it immediately
      if (typeof window !== 'undefined') {
        // Fetch fresh branding data to get all fields including companyName
        try {
          const freshResponse = await axios.get(Apis.getAgencyBranding, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          })

          if (
            freshResponse?.data?.status === true &&
            freshResponse?.data?.data?.branding
          ) {
            const freshBranding = freshResponse.data.data.branding

            // Update cookie and localStorage with complete branding data
            const cookieValue = encodeURIComponent(
              JSON.stringify(freshBranding),
            )
            // document.cookie = `agencyBranding=${cookieValue}; path=/; max-age=${60 * 60 * 24}`
            localStorage.setItem(
              'agencyBranding',
              JSON.stringify(freshBranding),
            )

            // Dispatch custom event to notify other components (like LoginComponent)
            window.dispatchEvent(
              new CustomEvent('agencyBrandingUpdated', {
                detail: freshBranding,
              }),
            )

            console.log(
              '✅ [BrandConfig] Updated cookie and localStorage with fresh branding data',
            )
          }
        } catch (error) {
          console.error(
            'Error fetching fresh branding for cookie update:',
            error,
          )
          // Fallback: update with what we have
          const updatedBranding = {
            logoUrl: logoUrl || originalValues.logoUrl,
            faviconUrl: faviconUrl || originalValues.faviconUrl,
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
          }
          const cookieValue = encodeURIComponent(
            JSON.stringify(updatedBranding),
          )
          // document.cookie = `agencyBranding=${cookieValue}; path=/; max-age=${60 * 60 * 24}`
          localStorage.setItem(
            'agencyBranding',
            JSON.stringify(updatedBranding),
          )
          window.dispatchEvent(
            new CustomEvent('agencyBrandingUpdated', {
              detail: updatedBranding,
            }),
          )
        }
      }
    } catch (error) {
      console.error('Error saving branding:', error)
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to save branding settings',
        isVisible: true,
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="text-gray-500">Loading branding settings...</div>
      </div>
    )
  }

  return (
    <div>
      <AgentSelectSnackMessage
        isVisible={showSnackMessage.isVisible}
        hide={() => {
          setShowSnackMessage({
            type: SnackbarTypes.Error,
            message: '',
            isVisible: false,
          })
        }}
        message={showSnackMessage.message}
        type={showSnackMessage.type}
      />

      {/* Logo Cropper Modal - Only render when image is available */}
      {imageToCrop && (
        <LogoCropper
          open={showCropper}
          onClose={() => {
            console.log('🚪 [BrandConfig] Closing cropper')
            setShowCropper(false)
            // Clear image after modal closes to prevent flicker
            setTimeout(() => setImageToCrop(null), 300)
          }}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          aspectRatio={3} // 3:1 horizontal aspect ratio (as per requirements)
        />
      )}

      {/* Banner Section */}
      <LabelingHeader
        img={'/agencyIcons/copied.png'}
        title={'Define your brand'}
        description={'Upload your logo and choose your brand colors.'}
      />

      {/* Brand Configuration Card */}
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          {/* Logo Upload */}
          <div className="self-stretch inline-flex justify-between items-center gap-[3px]">
            <div className="inline-flex flex-col justify-start items-start">
              <div className="inline-flex justify-start items-center gap-[3px]">
                <div className="text-black text-base font-normal leading-normal">
                  Logo
                </div>
                <WhiteLAbelTooltTip tip={Logo1Tip} />
              </div>
            </div>

            <UploadImageButton
              onFileSelect={handleLogoUpload}
              preview={logoPreview}
            />
          </div>

          {/* Favicon Upload */}
          <div className="self-stretch inline-flex justify-between items-center gap-[3px]">
            <div className="inline-flex flex-col justify-start items-start">
              <div className="inline-flex justify-start items-center gap-[3px]">
                <div className="text-black text-base font-normal leading-normal">
                  Favicon
                </div>
                <WhiteLAbelTooltTip tip={FaviconTip} />
              </div>
            </div>

            <UploadImageButton
              onFileSelect={handleFaviconUpload}
              preview={faviconPreview}
            />
          </div>

          <div className="self-stretch inline-flex justify-start items-center gap-[3px]">
            <div className="flex-1 flex justify-start items-center gap-[3px]">
              <div className="justify-start text-black text-base font-normal font-['Inter'] leading-normal">
                Primary color
              </div>
            </div>
            <div className="w-32 self-stretch bg-white/80 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-900/10 inline-flex flex-col justify-start items-start gap-[5px] overflow-hidden">
              <div
                className="self-stretch h-12 p-2.5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-start items-center gap-2"
                onClick={() =>
                  document.getElementById('primary-color-picker').click()
                }
              >
                <div
                  className="w-6 h-6 rounded-full shadow-[0px_5.591172695159912px_12.160799980163574px_0px_rgba(0,0,0,0.20)] border-[2.80px] border-white cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                ></div>
                <div className="flex-1 justify-start text-black text-base font-medium font-['Inter'] leading-snug">
                  {primaryColor}
                </div>
                <input
                  id="primary-color-picker"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => handlePrimaryColorChange(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                />
              </div>
            </div>
          </div>
          <div className="self-stretch inline-flex justify-start items-center gap-[3px]">
            <div className="flex-1 flex justify-start items-center gap-[3px]">
              <div className="justify-start text-black text-base font-normal font-['Inter'] leading-normal">
                Secondary color
              </div>

            </div>
            <div className="w-32 self-stretch bg-white/80 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-900/10 inline-flex flex-col justify-start items-start gap-[5px] overflow-hidden">
              <div
                className="self-stretch h-12 p-2.5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-start items-center gap-2"
                onClick={() =>
                  document.getElementById('secondary-color-picker').click()
                }
              >
                <div
                  className="w-6 h-6 rounded-full shadow-[0px_5.591172695159912px_12.160799980163574px_0px_rgba(0,0,0,0.20)] border-[2.80px] border-white cursor-pointer"
                  style={{ backgroundColor: secondaryColor }}
                ></div>
                <div className="flex-1 justify-start text-black text-base font-medium font-['Inter'] leading-snug">
                  {secondaryColor}
                </div>
                <input
                  id="secondary-color-picker"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => handleSecondaryColorChange(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="self-stretch inline-flex justify-between items-center mt-4">
            {hasChanges() && (
              <div
                className="px-4 py-2 bg-white/40 rounded-md outline outline-1 outline-slate-200 flex justify-center items-center gap-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleReset}
              >
                <div className="text-slate-900 text-base font-normal leading-relaxed">
                  Reset
                </div>
              </div>
            )}
            <div
              className={`px-4 py-2 rounded-md flex justify-center items-center gap-2.5 cursor-pointer transition-colors ${
                loading
                  ? 'bg-brand-primary/60 cursor-not-allowed'
                  : 'bg-brand-primary hover:bg-brand-primary/90'
              } ${!hasChanges() ? 'ml-auto' : ''}`}
              onClick={loading ? undefined : handleSave}
            >
              <div className="text-white text-base font-normal leading-relaxed">
                {loading ? 'Saving...' : 'Save Changes'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandConfig

const styles = {
  semiBoldHeading: { fontSize: 22, fontWeight: '600' },
  smallRegular: { fontSize: 13, fontWeight: '400' },
  regular: { fontSize: 16, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}

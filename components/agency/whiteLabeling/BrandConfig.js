import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { updateBrandingCookieAndApply } from '@/utilities/applyBranding'

import LabelingHeader from './LabelingHeader'
import LogoCropper from './LogoCropper'
import UploadImageButton from './UploadImageButton'
import WhiteLAbelTooltTip from './WhiteLAbelTooltTip'

const BrandConfig = ({ selectedAgency }) => {
  //tool tip
  const Logo1Tip =
    'Recommended upload: 600 × 200 px (max 2MB). Final crop: 400px × 133px (3x resolution for retina displays). Display: Max 120px width × 32px height. Logo will be cropped to fit.'
  const FaviconTip = 'Image should be maximum 512kb and should be square'

  const [logoPreview, setLogoPreview] = useState(null)
  const [faviconPreview, setFaviconPreview] = useState(null)
  const [faviconText, setFaviconText] = useState('')
  const [xbarTitle, setXbarTitle] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#7902DF')
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6')

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
    faviconText: '',
    primaryColor: '#7902DF',
    secondaryColor: '#8B5CF6',
  })

  // Fetch branding data on mount or when selectedAgency changes
  useEffect(() => {
    fetchBrandingData()
  }, [selectedAgency])

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

      // Add userId parameter if selectedAgency is provided (admin view)
      let apiUrl = Apis.getAgencyBranding
      if (selectedAgency?.id) {
        apiUrl += `?userId=${selectedAgency.id}`
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response?.data?.status === true && response?.data?.data) {
        const branding = response.data.data.branding || {}

        // Set form values - use defaults if no branding exists
        const defaultPrimary = '#7902DF'
        const defaultSecondary = '#8B5CF6'
        setPrimaryColor(branding.primaryColor || defaultPrimary)
        setSecondaryColor(branding.secondaryColor || defaultSecondary)

        // Set preview images if URLs exist
        if (branding.logoUrl) {
          setLogoPreview(branding.logoUrl)
        }
        if (branding.faviconUrl) {
          setFaviconPreview(branding.faviconUrl)
        }
        // Set favicon text if exists
        if (branding.faviconText) {
          setFaviconText(branding.faviconText)
        }
        // Set xbar title if exists
        if (branding.xbarTitle) {
          setXbarTitle(branding.xbarTitle)
        }

        // Store original values - use defaults if no branding exists
        setOriginalValues({
          logoUrl: branding.logoUrl || null,
          faviconUrl: branding.faviconUrl || null,
          faviconText: branding.faviconText || '',
          xbarTitle: branding.xbarTitle || '',
          primaryColor: branding.primaryColor || defaultPrimary,
          secondaryColor: branding.secondaryColor || defaultSecondary,
        })
      } else {
        // No branding data exists - set to defaults
        const defaultPrimary = '#7902DF'
        const defaultSecondary = '#8B5CF6'
        setPrimaryColor(defaultPrimary)
        setSecondaryColor(defaultSecondary)
        setFaviconText('')
        setXbarTitle('')
        setOriginalValues({
          logoUrl: null,
          faviconUrl: null,
          faviconText: '',
          xbarTitle: '',
          primaryColor: defaultPrimary,
          secondaryColor: defaultSecondary,
        })
      }
    } catch (error) {
      console.error('Error fetching branding data:', error)
      // If 404, no branding exists yet - set to defaults
      if (error.response?.status === 404) {
        const defaultPrimary = '#7902DF'
        const defaultSecondary = '#8B5CF6'
        setPrimaryColor(defaultPrimary)
        setSecondaryColor(defaultSecondary)
        setFaviconText('')
        setXbarTitle('')
        setOriginalValues({
          logoUrl: null,
          faviconUrl: null,
          faviconText: '',
          xbarTitle: '',
          primaryColor: defaultPrimary,
          secondaryColor: defaultSecondary,
        })
      } else {
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
    if (!file) {
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
      const imageDataUrl = e.target.result

      // Set both states together - React will batch the updates
      setImageToCrop(imageDataUrl)
      // Use setTimeout to ensure state is set before opening modal
      setTimeout(() => {
        setShowCropper(true)
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

    // Check if favicon text has changed
    const faviconTextChanged = faviconText !== originalValues.faviconText
    // Check if xbar title has changed
    const xbarTitleChanged = xbarTitle !== originalValues.xbarTitle

    return colorsChanged || logoChanged || faviconChanged || faviconTextChanged || xbarTitleChanged
  }

  //reset all the values to original and save defaults
  const handleReset = async () => {
    // Reset to default AssignX colors
    const defaultPrimary = '#7902DF'
    const defaultSecondary = '#8B5CF6'
    
    // Reset UI state to defaults
    setPrimaryColor(defaultPrimary)
    setSecondaryColor(defaultSecondary)
    setLogoPreview(originalValues.logoUrl)
    setFaviconPreview(originalValues.faviconUrl)
    setFaviconText(originalValues.faviconText)
    setXbarTitle(originalValues.xbarTitle)
    setLogoFile(null)
    setFaviconFile(null)

    // Save the default colors to agency branding
    try {
      const localData = localStorage.getItem('User')
      let authToken = null

      if (localData) {
        const userData = JSON.parse(localData)
        authToken = userData.token
      }

      if (authToken) {
        const colorsData = {
          primaryColor: defaultPrimary,
          secondaryColor: defaultSecondary,
        }
        
        // Add userId if selectedAgency is provided (admin view)
        if (selectedAgency?.id) {
          colorsData.userId = selectedAgency.id
        }

        await axios.put(Apis.updateAgencyBrandingColors, colorsData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })

        // Update original values after successful save
        setOriginalValues({
          ...originalValues,
          primaryColor: defaultPrimary,
          secondaryColor: defaultSecondary,
        })

        // Refresh data to get latest from server
        await fetchBrandingData()

        setShowSnackMessage({
          type: SnackbarTypes.Success,
          message: 'Brand colors reset to default',
          isVisible: true,
        })
      }
    } catch (error) {
      console.error('Error resetting colors:', error)
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'Failed to reset colors. Please try again.',
        isVisible: true,
      })
    }
  }

  // Upload logo file
  const uploadLogo = async (authToken) => {
    if (!logoFile) return null

    const formData = new FormData()
    formData.append('logo', logoFile)
    
    // Add userId if selectedAgency is provided (admin view)
    if (selectedAgency?.id) {
      formData.append('userId', selectedAgency.id)
    }

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
    
    // Add userId if selectedAgency is provided (admin view)
    if (selectedAgency?.id) {
      formData.append('userId', selectedAgency.id)
    }

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
          console.error('❌ [BrandConfig] Favicon upload returned null/undefined')
          throw new Error('Failed to upload favicon')
        }
        // Update preview immediately with server URL
        setFaviconPreview(faviconUrl)
      } else {}

      // Update colors if changed
      if (
        primaryColor !== originalValues.primaryColor ||
        secondaryColor !== originalValues.secondaryColor
      ) {
        const colorsData = {
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
        }
        
        // Add userId if selectedAgency is provided (admin view)
        if (selectedAgency?.id) {
          colorsData.userId = selectedAgency.id
        }

        await axios.put(Apis.updateAgencyBrandingColors, colorsData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
      }

      // Update favicon text if changed
      if (faviconText !== originalValues.faviconText) {
        const companyData = {
          faviconText: faviconText,
        }
        
        // Add userId if selectedAgency is provided (admin view)
        if (selectedAgency?.id) {
          companyData.userId = selectedAgency.id
        }

        const response = await axios.put(Apis.updateAgencyBrandingCompany, companyData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response?.data?.status) {
          throw new Error(response?.data?.message || 'Failed to update favicon text')
        }
      }

      // Update xbar title if changed
      if (xbarTitle !== originalValues.xbarTitle) {
        const companyData = {
          xbarTitle: xbarTitle,
        }
        
        // Add userId if selectedAgency is provided (admin view)
        if (selectedAgency?.id) {
          companyData.userId = selectedAgency.id
        }

        const response = await axios.put(Apis.updateAgencyBrandingCompany, companyData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response?.data?.status) {
          throw new Error(response?.data?.message || 'Failed to update xbar title')
        }
      }

      // Store the uploaded faviconUrl before fetchBrandingData might overwrite it
      const uploadedFaviconUrl = faviconUrl || originalValues.faviconUrl
      const uploadedLogoUrl = logoUrl || originalValues.logoUrl

      // Update original values with new data
      setOriginalValues({
        logoUrl: uploadedLogoUrl,
        faviconUrl: uploadedFaviconUrl,
        faviconText: faviconText,
        xbarTitle: xbarTitle,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
      })

      // Clear file states
      setLogoFile(null)
      setFaviconFile(null)

      // Refresh data to get latest from server
      try {
        await fetchBrandingData()
      } catch (error) {
        console.error('Error refreshing branding data after save:', error)
        // Continue even if refresh fails - save was successful
      }

      // Show success snackbar after all updates and refresh complete
      // Use setTimeout to ensure it shows even if state updates are batched
      setTimeout(() => {
        setShowSnackMessage({
          type: SnackbarTypes.Success,
          message: 'Branding settings saved successfully',
          isVisible: true,
        })
      }, 100)

      // Update cookie and apply branding immediately
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

            // Ensure we use the uploaded faviconUrl if the fresh response doesn't have it yet
            // This handles race conditions where the server hasn't updated yet
            const finalBranding = {
              ...freshBranding,
              // Use uploaded values if fresh response is missing them (race condition protection)
              faviconUrl: freshBranding.faviconUrl || uploadedFaviconUrl,
              logoUrl: freshBranding.logoUrl || uploadedLogoUrl,
              // Explicitly include xbarTitle and faviconText from current state (they were just saved)
              xbarTitle: freshBranding.xbarTitle || xbarTitle,
              faviconText: freshBranding.faviconText || faviconText,
            }

            // Update cookie and apply branding immediately using centralized function
            const applied = updateBrandingCookieAndApply(finalBranding, true)
            if (applied) {} else {
              console.warn('⚠️ [BrandConfig] Failed to update branding cookie')
            }
          } else {
            console.warn('⚠️ [BrandConfig] Fresh branding response invalid:', freshResponse?.data)
            // Fallback to uploaded values
            const fallbackBranding = {
              logoUrl: uploadedLogoUrl,
              faviconUrl: uploadedFaviconUrl,
              faviconText: faviconText,
              xbarTitle: xbarTitle,
              primaryColor: primaryColor,
              secondaryColor: secondaryColor,
            }
            const applied = updateBrandingCookieAndApply(fallbackBranding, true)
            if (applied) {}
          }
        } catch (error) {
          console.error(
            'Error fetching fresh branding for cookie update:',
            error,
          )
          // Fallback: update with what we have (use uploaded values)
          const updatedBranding = {
            logoUrl: uploadedLogoUrl,
            faviconUrl: uploadedFaviconUrl,
            faviconText: faviconText,
            xbarTitle: xbarTitle,
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
          }
          const applied = updateBrandingCookieAndApply(updatedBranding, true)
          if (applied) {}
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

          {/* Favicon Text Input */}
          <div className="self-stretch inline-flex justify-between items-center gap-[3px]">
            <div className="inline-flex flex-col justify-start items-start">
              <div className="inline-flex justify-start items-center gap-[3px]">
                <div className="text-black text-base font-normal leading-normal">
                  Xbar title
                </div>
              </div>
            </div>

            <input
              type="text"
              value={xbarTitle}
              onChange={(e) => setXbarTitle(e.target.value)}
              placeholder="Enter xbar title"
              className="w-64 px-3 py-2 border border-neutral-900/10 rounded-[10px] outline-none focus:outline-none focus:ring-0 focus:border-brand-primary text-black text-base font-normal"
              style={{
                fontSize: '15px',
                fontWeight: '500',
              }}
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
            {hasChanges() && (
              <div
                className={`px-4 py-2 rounded-md flex justify-center items-center gap-2.5 cursor-pointer transition-colors ${
                  loading
                    ? 'bg-brand-primary/60 cursor-not-allowed'
                    : 'bg-brand-primary hover:bg-brand-primary/90'
                }`}
                onClick={loading ? undefined : handleSave}
              >
                <div className="text-white text-base font-normal leading-relaxed">
                  {loading ? 'Saving...' : 'Save Changes'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandConfig

const styles = {
  semiBoldHeading: { fontSize: 22, fontWeight: '600' },
  smallRegular: { fontSize: 13, fontWeight: '400' },
  regular: { fontSize: 16, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}

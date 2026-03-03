import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'

import Apis from '@/components/apis/Apis'
import RichTextEditor from '@/components/common/RichTextEditor'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { DEFAULT_TERMS_TEXT } from '@/constants/agencyTermsPrivacy'

import LabelingHeader from './LabelingHeader'
import { getPolicyUrls } from '@/utils/getPolicyUrls'
import Image from 'next/image'

const TermsConfig = ({ selectedAgency }) => {
  const [termsText, setTermsText] = useState('')
  const [originalText, setOriginalText] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showSnackMessage, setShowSnackMessage] = useState({
    type: SnackbarTypes.Error,
    message: '',
    isVisible: false,
  })
  const richTextEditorRef = useRef(null);

  //opening cancellation in new tab
  const getTermsUrl = async () => {
    const { termsUrl } = await getPolicyUrls(null, true);
    window.open(termsUrl, '_blank')
  }

  // Fetch terms text on mount or when selectedAgency changes
  useEffect(() => {
    fetchTermsText()
  }, [selectedAgency])

  const fetchTermsText = async () => {
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
        const customTermsText = branding.termsText

        if (customTermsText) {
          // Use custom text if exists
          setTermsText(customTermsText)
          setOriginalText(customTermsText)
        } else {
          // Use default text from constants
          setTermsText(DEFAULT_TERMS_TEXT)
          setOriginalText(DEFAULT_TERMS_TEXT)
        }
      } else {
        // No branding data, use default text from constants
        setTermsText(DEFAULT_TERMS_TEXT)
        setOriginalText(DEFAULT_TERMS_TEXT)
      }
    } catch (error) {
      console.error('Error fetching terms text:', error)
      // On error, use default text from constants
      setTermsText(DEFAULT_TERMS_TEXT)
      setOriginalText(DEFAULT_TERMS_TEXT)
      if (error.response?.status !== 404) {
        setShowSnackMessage({
          type: SnackbarTypes.Error,
          message:
            error.response?.data?.message ||
            'Failed to fetch terms & conditions',
          isVisible: true,
        })
      }
    } finally {
      setFetching(false)
    }
  }

  // Check if there are any unsaved changes
  const hasChanges = () => {
    return termsText !== originalText
  }

  // Reset to original text
  const handleReset = () => {
    setTermsText(originalText)
  }

  // Save terms text
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

      const updateData = {
        termsText: termsText,
      }

      // Add userId if selectedAgency is provided (admin view)
      if (selectedAgency?.id) {
        updateData.userId = selectedAgency.id
      }

      const response = await axios.put(
        Apis.updateAgencyTermsPrivacy,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response?.data?.status === true) {
        setOriginalText(termsText)
        setShowSnackMessage({
          type: SnackbarTypes.Success,
          message: 'Terms & conditions saved successfully',
          isVisible: true,
        })
      } else {
        throw new Error(
          response?.data?.message || 'Failed to save terms & conditions',
        )
      }
    } catch (error) {
      console.error('Error saving terms & conditions:', error)
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to save terms & conditions',
        isVisible: true,
      })
    } finally {
      setLoading(false)
    }
  }

  if (false) {
    return (
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="text-gray-500">Loading terms & conditions...</div>
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

      {/* Header Section */}
      <LabelingHeader
        img={'/agencyIcons/copied.png'}
        title={'Terms & Conditions'}
        description={
          "Customize your terms & conditions text for your subaccounts. This will be displayed on your agency's terms page."
        }
      />

      {fetching ? (
        <div className="w-full flex flex-row justify-center pt-8">
          <div className="text-gray-500">Loading terms & conditions...</div>
        </div>
      ) : (

        <>
          {/* Terms Editor Card */}
          <div className="w-full flex flex-row justify-center pt-8">
            <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
              <div className="self-stretch">
                <div className='mb-2 flex flex-row items-center justify-between'>
                  <div className="text-black text-base font-normal leading-normal mb-2">
                    Terms & Conditions Content
                  </div>
                  <button
                    style={{
                      pointerEvents: 'auto',
                      zIndex: 10,
                    }}
                    onClick={() => {
                      getTermsUrl();
                      return
                    }}
                  >
                    <Image
                      src={'/svgIcons/arrowboxIcon.svg'}
                      height={20}
                      width={20}
                      alt="*"
                    />
                  </button>
                </div>
                <RichTextEditor
                  ref={richTextEditorRef}
                  value={termsText}
                  onChange={(html) => {
                    setTermsText(html)
                  }}
                  placeholder="Enter terms & conditions text..."
                />
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
                  className={`px-4 py-2 rounded-md flex justify-center items-center gap-2.5 cursor-pointer transition-colors ${loading
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
        </>
      )}
    </div>
  )
}

export default TermsConfig

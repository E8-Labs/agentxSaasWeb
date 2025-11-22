'use client'

import { CircularProgress } from '@mui/material'
import axios from 'axios'
import DOMPurify from 'dompurify'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { DEFAULT_PRIVACY_POLICY_TEXT } from '@/constants/agencyTermsPrivacy'

function SubAccountPrivacy() {
  const [privacyText, setPrivacyText] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPrivacyText()
  }, [])

  const fetchPrivacyText = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user data to access agency UUID
      const userData = localStorage.getItem('User')
      let agencyUUID = null

      if (userData) {
        const d = JSON.parse(userData)
        const user = d.user

        // For subaccounts, get agency UUID from multiple possible sources
        if (user?.agencyBranding?.agencyUuid) {
          agencyUUID = user.agencyBranding.agencyUuid
        } else if (user?.agency?.agencyUuid) {
          agencyUUID = user.agency.agencyUuid
        }
      }

      if (agencyUUID) {
        const response = await axios.get(Apis.getAgencyPrivacyByUUID, {
          params: {
            agencyUUID: agencyUUID,
          },
        })

        if (response?.data?.status === true) {
          const customPrivacyText = response.data.data?.privacyText

          if (customPrivacyText) {
            // Agency has custom privacy text
            setPrivacyText(customPrivacyText)
          } else {
            // No custom text, use default from constants
            setPrivacyText(DEFAULT_PRIVACY_POLICY_TEXT)
          }
        } else {
          // Use default from constants
          setPrivacyText(DEFAULT_PRIVACY_POLICY_TEXT)
        }
      } else {
        // No agency UUID, use default from constants
        setPrivacyText(DEFAULT_PRIVACY_POLICY_TEXT)
      }
    } catch (err) {
      console.error('Error fetching privacy text:', err)
      setError('Failed to load privacy policy')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto">
        <div className="w-full flex flex-row justify-center items-center pt-8">
          <CircularProgress />
        </div>
      </div>
    )
  }

  if (error || !privacyText) {
    return (
      <div className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto">
        <div className="w-full flex flex-col">
          <div style={{ fontSize: 22, fontWeight: '700', color: '#000' }}>
            Privacy Policy
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: '#00000090',
            }}
          >
            Account {'>'} Privacy Policy
          </div>
        </div>
        <div className="w-full flex flex-row justify-center items-center pt-8">
          <div className="text-gray-600">
            {error || 'Privacy policy not available'}
          </div>
        </div>
      </div>
    )
  }

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(privacyText, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'ol',
      'ul',
      'li',
      'a',
      'span',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  })

  return (
    <div className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto">
      <div className="w-full flex flex-col mb-6">
        <div style={{ fontSize: 22, fontWeight: '700', color: '#000' }}>
          Privacy Policy
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: '#00000090',
          }}
        >
          Account {'>'} Privacy Policy
        </div>
      </div>

      <div className="w-full bg-white rounded-lg shadow-sm p-8">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </div>
  )
}

export default SubAccountPrivacy

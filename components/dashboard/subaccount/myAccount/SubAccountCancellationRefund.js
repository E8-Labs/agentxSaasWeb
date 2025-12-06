'use client'

import { CircularProgress } from '@mui/material'
import axios from 'axios'
import DOMPurify from 'dompurify'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { DEFAULT_CANCELLATION_REFUND_TEXT } from '@/constants/agencyTermsPrivacy'

function SubAccountCancellationRefund() {
  const [cancellationRefundText, setCancellationRefundText] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCancellationRefundText()
  }, [])

  const fetchCancellationRefundText = async () => {
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
        // Try to get cancellation & refund text from branding API
        // Since there's no dedicated endpoint, we'll use getAgencyBranding
        const localData = localStorage.getItem('User')
        let authToken = null

        if (localData) {
          const userData = JSON.parse(localData)
          authToken = userData.token
        }

        if (authToken) {
          try {
            const response = await axios.get(Apis.getAgencyBranding, {
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            })

            if (response?.data?.status === true && response?.data?.data) {
              const branding = response.data.data.branding || {}
              const customCancellationRefundText = branding.cancellationRefundText

              if (customCancellationRefundText) {
                // Agency has custom cancellation & refund text
                setCancellationRefundText(customCancellationRefundText)
              } else {
                // No custom text, use default from constants
                setCancellationRefundText(DEFAULT_CANCELLATION_REFUND_TEXT)
              }
            } else {
              // Use default from constants
              setCancellationRefundText(DEFAULT_CANCELLATION_REFUND_TEXT)
            }
          } catch (err) {
            console.error('Error fetching cancellation & refund text:', err)
            // Use default from constants on error
            setCancellationRefundText(DEFAULT_CANCELLATION_REFUND_TEXT)
          }
        } else {
          // No auth token, use default from constants
          setCancellationRefundText(DEFAULT_CANCELLATION_REFUND_TEXT)
        }
      } else {
        // No agency UUID, use default from constants
        setCancellationRefundText(DEFAULT_CANCELLATION_REFUND_TEXT)
      }
    } catch (err) {
      console.error('Error fetching cancellation & refund text:', err)
      setError('Failed to load cancellation & refund policy')
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

  if (error || !cancellationRefundText) {
    return (
      <div className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto">
        <div className="w-full flex flex-col">
          <div style={{ fontSize: 22, fontWeight: '700', color: '#000' }}>
            Cancellation & Refund
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: '#00000090',
            }}
          >
            Account {'>'} Cancellation & Refund
          </div>
        </div>
        <div className="w-full flex flex-row justify-center items-center pt-8">
          <div className="text-gray-600">
            {error || 'Cancellation & refund policy not available'}
          </div>
        </div>
      </div>
    )
  }

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(cancellationRefundText, {
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
          Cancellation & Refund
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: '#00000090',
          }}
        >
          Account {'>'} Cancellation & Refund
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

export default SubAccountCancellationRefund


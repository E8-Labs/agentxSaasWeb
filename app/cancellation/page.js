'use client'

import axios from 'axios'
import DOMPurify from 'dompurify'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { agencyCancellationAndRefundUrl } from '@/constants/Constants'

function CancellationPage() {
  const [cancellationText, setCancellationText] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCancellationText()
  }, [])

  const fetchCancellationText = async () => {
    if (typeof window === 'undefined') return
    const domain = window.location.host
    if (!domain) {
      setLoading(false)
      window.location.href = agencyCancellationAndRefundUrl
      return
    }
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(Apis.getAgencyCancellationByDomain, {
        params: { domain },
      })

      if (response?.data?.status === true) {
        const customCancellationText = response.data.data?.cancellationText
        if (customCancellationText) {
          setCancellationText(customCancellationText)
        } else {
          window.location.href = agencyCancellationAndRefundUrl
          return
        }
      } else {
        window.location.href = agencyCancellationAndRefundUrl
        return
      }
    } catch (err) {
      console.error('Error fetching cancellation text:', err)
      window.location.href = agencyCancellationAndRefundUrl
      return
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cancellation policy...</p>
        </div>
      </div>
    )
  }

  if (error || !cancellationText) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to cancellation policy...</p>
        </div>
      </div>
    )
  }

  const sanitizedContent = DOMPurify.sanitize(cancellationText, {
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
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </div>
    </div>
  )
}

export default CancellationPage

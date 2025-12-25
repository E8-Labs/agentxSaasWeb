'use client'

import axios from 'axios'
import DOMPurify from 'dompurify'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'

function CancellationPage() {
  const params = useParams()
  const router = useRouter()
  const [cancellationText, setCancellationText] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const agencyUUID = params?.agencyUUID

  useEffect(() => {
    if (agencyUUID) {
      fetchCancellationText()
    }
  }, [agencyUUID])

  const fetchCancellationText = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(Apis.getAgencyCancellationByUUID, {
        params: {
          agencyUUID: agencyUUID,
        },
      })

      if (response?.data?.status === true) {
        const customCancellationText = response.data.data?.cancellationText

        if (customCancellationText) {
          // Agency has custom cancellation text
          setCancellationText(customCancellationText)
        } else {
          // No custom text, redirect to default URL
          window.location.href = 'https://www.assignx.ai/agency-cancellation'
          return
        }
      } else {
        // Agency not found or error, redirect to default
        window.location.href = 'https://www.assignx.ai/agency-cancellation'
        return
      }
    } catch (err) {
      console.error('Error fetching cancellation text:', err)
      // On error, redirect to default URL
      window.location.href = 'https://www.assignx.ai/agency-cancellation'
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

  // Sanitize HTML content
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



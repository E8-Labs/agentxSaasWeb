'use client'

import axios from 'axios'
import DOMPurify from 'dompurify'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { agencyPrivacyPolicyUrl } from '@/constants/Constants'

/**
 * Agency privacy page by UUID. Used when agency has no custom domain
 * (links are baseurl/agency/[agencyUUID]/privacy).
 */
function PrivacyPage() {
  const params = useParams()
  const [privacyText, setPrivacyText] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const agencyUUID = params?.agencyUUID

  useEffect(() => {
    if (agencyUUID) {
      fetchPrivacyText()
    }
  }, [agencyUUID])

  const fetchPrivacyText = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(Apis.getAgencyPrivacyByUUID, {
        params: { agencyUUID },
      })

      if (response?.data?.status === true) {
        const customPrivacyText = response.data.data?.privacyText
        if (customPrivacyText) {
          setPrivacyText(customPrivacyText)
        } else {
          window.location.href = agencyPrivacyPolicyUrl
          return
        }
      } else {
        window.location.href = agencyPrivacyPolicyUrl
        return
      }
    } catch (err) {
      console.error('Error fetching privacy text:', err)
      window.location.href = agencyPrivacyPolicyUrl
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
          <p className="mt-4 text-gray-600">Loading privacy policy...</p>
        </div>
      </div>
    )
  }

  if (error || !privacyText) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to privacy policy...</p>
        </div>
      </div>
    )
  }

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

export default PrivacyPage

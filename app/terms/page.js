'use client'

import axios from 'axios'
import DOMPurify from 'dompurify'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { agencyTermsAndConditionUrl } from '@/constants/Constants'

function TermsPage() {
  const [termsText, setTermsText] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTermsText()
  }, [])

  const fetchTermsText = async () => {
    if (typeof window === 'undefined') return
    const domain = window.location.host
    if (!domain) {
      setLoading(false)
      window.location.href = agencyTermsAndConditionUrl
      return
    }
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(Apis.getAgencyTermsByDomain, {
        params: { domain },
      })

      if (response?.data?.status === true) {
        const customTermsText = response.data.data?.termsText
        if (customTermsText) {
          setTermsText(customTermsText)
        } else {
          window.location.href = agencyTermsAndConditionUrl
          return
        }
      } else {
        window.location.href = agencyTermsAndConditionUrl
        return
      }
    } catch (err) {
      console.error('Error fetching terms text:', err)
      window.location.href = agencyTermsAndConditionUrl
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
          <p className="mt-4 text-gray-600">Loading terms & conditions...</p>
        </div>
      </div>
    )
  }

  if (error || !termsText) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to terms & conditions...</p>
        </div>
      </div>
    )
  }

  const sanitizedContent = DOMPurify.sanitize(termsText, {
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

export default TermsPage

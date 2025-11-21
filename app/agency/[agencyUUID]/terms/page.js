"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import DOMPurify from 'dompurify';

function TermsPage() {
  const params = useParams();
  const router = useRouter();
  const [termsText, setTermsText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const agencyUUID = params?.agencyUUID;

  useEffect(() => {
    if (agencyUUID) {
      fetchTermsText();
    }
  }, [agencyUUID]);

  const fetchTermsText = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(Apis.getAgencyTermsByUUID, {
        params: {
          agencyUUID: agencyUUID,
        },
      });

      if (response?.data?.status === true) {
        const customTermsText = response.data.data?.termsText;
        
        if (customTermsText) {
          // Agency has custom terms text
          setTermsText(customTermsText);
        } else {
          // No custom text, redirect to default URL
          window.location.href = 'https://www.assignx.ai/agency-terms';
          return;
        }
      } else {
        // Agency not found or error, redirect to default
        window.location.href = 'https://www.assignx.ai/agency-terms';
        return;
      }
    } catch (err) {
      console.error('Error fetching terms text:', err);
      // On error, redirect to default URL
      window.location.href = 'https://www.assignx.ai/agency-terms';
      return;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading terms & conditions...</p>
        </div>
      </div>
    );
  }

  if (error || !termsText) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to terms & conditions...</p>
        </div>
      </div>
    );
  }

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(termsText, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

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
  );
}

export default TermsPage;




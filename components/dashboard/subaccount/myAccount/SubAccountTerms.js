"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import DOMPurify from 'dompurify';
import { CircularProgress } from '@mui/material';
import { DEFAULT_TERMS_TEXT } from '@/constants/agencyTermsPrivacy';

function SubAccountTerms() {
  const [termsText, setTermsText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTermsText();
  }, []);

  const fetchTermsText = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user data to access agency UUID
      const userData = localStorage.getItem("User");
      let agencyUUID = null;
      
      if (userData) {
        const d = JSON.parse(userData);
        const user = d.user;
        
        // For subaccounts, get agency UUID from multiple possible sources
        if (user?.agencyBranding?.agencyUuid) {
          agencyUUID = user.agencyBranding.agencyUuid;
        } else if (user?.agency?.agencyUuid) {
          agencyUUID = user.agency.agencyUuid;
        }
      }

      if (agencyUUID) {
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
            // No custom text, use default from constants
            setTermsText(DEFAULT_TERMS_TEXT);
          }
        } else {
          // Use default from constants
          setTermsText(DEFAULT_TERMS_TEXT);
        }
      } else {
        // No agency UUID, use default from constants
        setTermsText(DEFAULT_TERMS_TEXT);
      }
    } catch (err) {
      console.error('Error fetching terms text:', err);
      setError('Failed to load terms & conditions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto">
        <div className="w-full flex flex-row justify-center items-center pt-8">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (error || !termsText) {
    return (
      <div className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto">
        <div className="w-full flex flex-col">
          <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
            Terms & Conditions
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: "#00000090",
            }}
          >
            Account {'>'} Terms & Conditions
          </div>
        </div>
        <div className="w-full flex flex-row justify-center items-center pt-8">
          <div className="text-gray-600">{error || 'Terms & conditions not available'}</div>
        </div>
      </div>
    );
  }

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(termsText, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  });

  return (
    <div className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto">
      <div className="w-full flex flex-col mb-6">
        <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
          Terms & Conditions
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: "#00000090",
          }}
        >
          Account {'>'} Terms & Conditions
        </div>
      </div>

      <div className="w-full bg-white rounded-lg shadow-sm p-8">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </div>
  );
}

export default SubAccountTerms;


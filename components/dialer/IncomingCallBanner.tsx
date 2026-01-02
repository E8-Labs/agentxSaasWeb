'use client'

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Phone } from 'lucide-react'
import { formatPhoneNumber } from '@/utilities/agentUtilities'
import { openDialer, hideIncomingCallBanner, selectIncomingCallBanner } from '@/store/slices/dialerSlice'

export default function IncomingCallBanner() {
  const dispatch = useDispatch()
  const bannerState = useSelector(selectIncomingCallBanner)

  if (!bannerState.visible) {
    return null
  }

  const handleAccept = () => {
    // Get the incoming call from global store
    const incomingCall = typeof window !== 'undefined' ? (window as any).__dialerGlobalIncomingCall : null
    
    // Open dialer modal with lead info
    dispatch(openDialer({
      leadId: bannerState.leadId,
      leadName: bannerState.callerName,
      phoneNumber: bannerState.callerPhoneNumber,
      selectedLeadDetails: bannerState.leadId ? { id: bannerState.leadId, name: bannerState.callerName, phone: bannerState.callerPhoneNumber } : undefined,
    }))

    // Call the global accept function
    if (typeof window !== 'undefined' && (window as any).__dialerAcceptIncomingCall) {
      (window as any).__dialerAcceptIncomingCall()
    }

    dispatch(hideIncomingCallBanner())
  }

  const handleDecline = () => {
    // Call the global reject function
    if (typeof window !== 'undefined' && (window as any).__dialerRejectIncomingCall) {
      (window as any).__dialerRejectIncomingCall()
    }
    dispatch(hideIncomingCallBanner())
  }

  return (
    <div
      className="fixed right-4 top-20 z-[1500]"
      style={{
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div
        className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-[380px]"
        style={{
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.1)' }}
            >
              <Phone
                size={24}
                style={{ color: 'hsl(var(--brand-primary))' }}
                className="animate-pulse"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium mb-1">Incoming Call</div>
              <div className="text-base font-semibold text-gray-900 truncate">
                {bannerState.callerName || formatPhoneNumber(bannerState.callerPhoneNumber)}
              </div>
              {bannerState.callerName && (
                <div className="text-sm text-gray-500 truncate">
                  {formatPhoneNumber(bannerState.callerPhoneNumber)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          {/* Decline Button */}
          <button
            onClick={handleDecline}
            className="flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '2px solid #ef4444',
              padding: 0,
              cursor: 'pointer',
            }}
            title="Decline"
          >
            <Phone
              size={24}
              className="rotate-135"
              style={{ color: 'white' }}
            />
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #10b981',
              padding: 0,
              cursor: 'pointer',
            }}
            title="Accept"
          >
            <Phone
              size={24}
              style={{ color: 'white' }}
            />
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}


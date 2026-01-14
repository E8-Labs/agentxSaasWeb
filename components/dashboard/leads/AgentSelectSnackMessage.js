'use client'

import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export const SnackbarTypes = {
  Error: 'Error',
  Warning: 'Warning',
  Success: 'Success',
  Loading: 'Loading',
}

const DefaultMessage = null

export default function AgentSelectSnackMessage({
  title = null,
  message = DefaultMessage,
  type = SnackbarTypes.Error,
  time = 4000,
  isVisible,
  hide,
}) {
  const toastIdRef = useRef(null)
  const lastMessageRef = useRef(null)
  const timerRef = useRef(null)
  const prevIsVisibleRef = useRef(false)
  const lastShownMessageKeyRef = useRef(null)
  const showToastTimeoutRef = useRef(null)

  useEffect(() => {
    // Dismiss existing toast when visibility becomes false
    if (!isVisible) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = null
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (showToastTimeoutRef.current) {
        clearTimeout(showToastTimeoutRef.current)
        showToastTimeoutRef.current = null
      }
      lastMessageRef.current = null
      lastShownMessageKeyRef.current = null
      prevIsVisibleRef.current = false
      return
    }

    // Only show toast when isVisible transitions from false to true
    // OR when the message content actually changes while visible
    const currentMessage = title || message
    const messageKey = `${currentMessage}-${type}`
    const isVisibilityTransition = !prevIsVisibleRef.current && isVisible
    const isMessageChange = lastShownMessageKeyRef.current !== messageKey && isVisible

    // Show toast only on visibility transition or message change
    if ((isVisibilityTransition || isMessageChange) && (message || title)) {
      // Always dismiss ALL existing toasts before showing a new one
      // This prevents overlapping when multiple snack messages appear simultaneously
      // Using toast.dismiss() without ID dismisses all toasts
      toast.dismiss()
      
      // Also clear our own refs
      if (toastIdRef.current) {
        toastIdRef.current = null
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (showToastTimeoutRef.current) {
        clearTimeout(showToastTimeoutRef.current)
        showToastTimeoutRef.current = null
      }

      // Small delay to ensure dismiss animation completes before showing new toast
      // This prevents visual overlap
      showToastTimeoutRef.current = setTimeout(() => {
        const toastMessage = title || message
        const toastDescription = title ? message : null

        const toastOptions = {
          // duration: time,
          // description: toastDescription,
          // style: {
          //   width: 'fit-content',
          //   maxWidth: '90vw',
          //   minWidth: 'fit-content',
          //   whiteSpace: 'nowrap',
          // },
          // className: 'toast-no-wrap',
        }

        // Use typed toast functions - they will use the custom icons from Toaster component
        let toastId
        switch (type) {
          case SnackbarTypes.Success:
            toastId = toast.success(toastMessage, toastOptions)
            break
          case SnackbarTypes.Error:
            toastId = toast.error(toastMessage, toastOptions)
            break
          case SnackbarTypes.Warning:
            toastId = toast.warning(toastMessage, toastOptions)
            break
          case SnackbarTypes.Loading:
            toastId = toast.loading(toastMessage, toastOptions)
            break
          default:
            toastId = toast(toastMessage, toastOptions)
        }

        toastIdRef.current = toastId
        lastMessageRef.current = messageKey
        lastShownMessageKeyRef.current = messageKey
        prevIsVisibleRef.current = true

        // Auto-dismiss after timer and call hide callback
        timerRef.current = setTimeout(() => {
          if (toastIdRef.current) {
            // toast.dismiss(toastIdRef.current);
            toastIdRef.current = null
          }
          if (hide) {
            hide()
          }
          timerRef.current = null
        }, time)
        showToastTimeoutRef.current = null
      }, 100) // 100ms delay to allow dismiss animation to complete
    } else if (isVisible) {
      // Update prevIsVisibleRef even if we don't show toast
      // This prevents re-showing when other props change
      prevIsVisibleRef.current = true
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (showToastTimeoutRef.current) {
        clearTimeout(showToastTimeoutRef.current)
        showToastTimeoutRef.current = null
      }
    }
    // Only depend on isVisible and message content, not on hide callback or other props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, message, title, type, time])

  // Return null since Sonner handles rendering
  return null
}

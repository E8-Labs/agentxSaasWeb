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
      lastMessageRef.current = null
      return
    }

    // Show toast when isVisible is true and we have a message
    if (isVisible && (message || title)) {
      const currentMessage = title || message
      const messageKey = `${currentMessage}-${type}`

      // Always dismiss any existing toast before showing a new one
      // This prevents stacking when messages appear quickly
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = null
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }

      // Show toast - allow showing same message again if isVisible was reset
      // Reset lastMessageRef if we're showing again (means user clicked again)
      if (lastMessageRef.current === messageKey) {
        // Same message being shown again - reset the ref to allow it to show
        lastMessageRef.current = null
      }

      const toastMessage = title || message
      const toastDescription = title ? message : null

      const toastOptions = {
        duration: time,
        description: toastDescription,
        style: {
          width: 'fit-content',
          maxWidth: '90vw',
          minWidth: 'fit-content',
          whiteSpace: 'nowrap',
        },
        className: 'toast-no-wrap',
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
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isVisible, message, title, type, time, hide])

  // Return null since Sonner handles rendering
  return null
}

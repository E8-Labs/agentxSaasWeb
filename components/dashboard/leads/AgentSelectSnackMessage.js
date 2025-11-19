"use client"

import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

export const SnackbarTypes = {
  Error: "Error",
  Warning: "Warning",
  Success: "Success",
  Loading: "Loading"
};

const DefaultMessage = null;

// Calculate dynamic width based on text length
const calculateToastWidth = (title, description) => {
  // Base width for padding, icon, and spacing
  const baseWidth = 60;
  // Average character width in pixels (approximate)
  const charWidth = 7;
  
  // Calculate width for title
  const titleLength = title ? title.length : 0;
  const titleWidth = titleLength * charWidth;
  
  // Calculate width for description (if exists)
  const descLength = description ? description.length : 0;
  const descWidth = descLength * charWidth;
  
  // Use the longer of title or description, but consider both
  const maxTextWidth = Math.max(titleWidth, descWidth);
  
  // Calculate total width
  let totalWidth = baseWidth + maxTextWidth;
  
  // Set min and max widths for better UX
  const minWidth = 20; // Minimum readable width
  // Max width with padding, responsive (handle SSR)
  const maxWidth = typeof window !== 'undefined' 
    ? Math.min(window.innerWidth - 40, 600) 
    : 600;
  
  // Clamp the width between min and max
  totalWidth = Math.max(minWidth, Math.min(totalWidth, maxWidth));
  
  return `${totalWidth}px`;
};

export default function AgentSelectSnackMessage({
  title = null,
  message = DefaultMessage,
  type = SnackbarTypes.Error,
  time = 4000,
  isVisible,
  hide,
}) {
  const toastIdRef = useRef(null);
  const lastMessageRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Dismiss existing toast when visibility becomes false
    if (!isVisible) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
    }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      lastMessageRef.current = null;
      return;
    }

    // Show toast when isVisible is true and we have a message
    if (isVisible && (message || title)) {
      const currentMessage = title || message;
      const messageKey = `${currentMessage}-${type}`;
      
      // Only show new toast if message or type changed
      if (lastMessageRef.current !== messageKey) {
        // Dismiss previous toast if it exists
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
        }
        if (timerRef.current) {
          clearTimeout(timerRef.current);
    }

        const toastMessage = title || message;
        const toastDescription = title ? message : null;
        
        // Calculate dynamic width based on message length
        const dynamicWidth = calculateToastWidth(toastMessage, toastDescription);
        
        const toastOptions = {
          duration: time,
          description: toastDescription,
          style: {
            width: dynamicWidth,
            maxWidth: dynamicWidth,
            minWidth: dynamicWidth,
            left: '50%',
            transform: 'translateX(-50%)',
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        };

        // Use typed toast functions - they will use the custom icons from Toaster component
        let toastId;
        switch (type) {
          case SnackbarTypes.Success:
            toastId = toast.success(toastMessage, toastOptions);
            break;
          case SnackbarTypes.Error:
            toastId = toast.error(toastMessage, toastOptions);
            break;
          case SnackbarTypes.Warning:
            toastId = toast.warning(toastMessage, toastOptions);
            break;
          case SnackbarTypes.Loading:
            toastId = toast.loading(toastMessage, toastOptions);
            break;
          default:
            toastId = toast(toastMessage, toastOptions);
        }

        toastIdRef.current = toastId;
        lastMessageRef.current = messageKey;

        // Auto-dismiss after timer and call hide callback
        timerRef.current = setTimeout(() => {
          if (toastIdRef.current) {
            // toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
          }
          if (hide) {
        hide();
          }
          timerRef.current = null;
      }, time);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isVisible, message, title, type, time, hide]);

  // Return null since Sonner handles rendering
  return null;
}

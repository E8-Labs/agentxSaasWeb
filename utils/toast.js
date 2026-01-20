import { toast as sonnerToast } from 'sonner'

// Wrapper that always dismisses existing toasts before showing new one
// This ensures only one toast is visible at a time across the entire app
// Uses a small synchronous delay to ensure dismiss is processed before showing
const dismissAndShow = (method, message, options) => {
  // Dismiss all existing toasts immediately
  sonnerToast.dismiss()
  
  // Show new toast immediately after dismiss
  // The dismiss is called first, so it will be processed before the new toast appears
  // This minimizes the overlap window
  return sonnerToast[method](message, options)
}

// Create toast object with methods
const toastObject = {
  success: (message, options) => {
    // Dismiss immediately - this ensures it's processed first
    sonnerToast.dismiss()
    // Show new toast - dismiss was called first, minimizing overlap
    return sonnerToast.success(message, options)
  },
  error: (message, options) => {
    sonnerToast.dismiss()
    return sonnerToast.error(message, options)
  },
  warning: (message, options) => {
    sonnerToast.dismiss()
    return sonnerToast.warning(message, options)
  },
  info: (message, options) => {
    sonnerToast.dismiss()
    return sonnerToast.info(message, options)
  },
  loading: (message, options) => {
    sonnerToast.dismiss()
    return sonnerToast.loading(message, options)
  },
  promise: (promise, options) => {
    sonnerToast.dismiss()
    return sonnerToast.promise(promise, options)
  },
  dismiss: (id) => {
    if (id) {
      return sonnerToast.dismiss(id)
    }
    // If no ID provided, dismiss all
    return sonnerToast.dismiss()
  },
  // Keep all other methods available
  message: (message, options) => {
    sonnerToast.dismiss()
    return sonnerToast.message(message, options)
  },
  custom: (jsx, options) => {
    sonnerToast.dismiss()
    return sonnerToast.custom(jsx, options)
  },
}

// Make toast callable as a function (default export behavior)
const toast = (message, options) => {
  sonnerToast.dismiss()
  return sonnerToast(message, options)
}

// Attach all methods to the function
Object.assign(toast, toastObject)

export { toast }

import { toast as sonnerToast } from 'sonner'

// Wrapper that always dismisses existing toasts before showing new one
// This ensures only one toast is visible at a time across the entire app
const dismissAndShow = (method, message, options) => {
  sonnerToast.dismiss() // Dismiss all existing toasts
  return sonnerToast[method](message, options)
}

// Create toast object with methods
const toastObject = {
  success: (message, options) => dismissAndShow('success', message, options),
  error: (message, options) => dismissAndShow('error', message, options),
  warning: (message, options) => dismissAndShow('warning', message, options),
  info: (message, options) => dismissAndShow('info', message, options),
  loading: (message, options) => dismissAndShow('loading', message, options),
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
  message: (message, options) => dismissAndShow('message', message, options),
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

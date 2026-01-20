import { toast as sonnerToast } from 'sonner'

// Type for toast options (using any to match sonner's internal types)
type ToastOptions = any

// Wrapper that always dismisses existing toasts before showing new one
// This ensures only one toast is visible at a time across the entire app
const dismissAndShow = (method: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'message', message: string, options?: ToastOptions) => {
  sonnerToast.dismiss() // Dismiss all existing toasts
  return sonnerToast[method](message, options)
}

// Define the toast interface
interface ToastFunction {
  (message: string, options?: ToastOptions): string | number
  success: (message: string, options?: ToastOptions) => string | number
  error: (message: string, options?: ToastOptions) => string | number
  warning: (message: string, options?: ToastOptions) => string | number
  info: (message: string, options?: ToastOptions) => string | number
  loading: (message: string, options?: ToastOptions) => string | number
  promise: <T>(promise: Promise<T>, options?: any) => any
  dismiss: (id?: string | number) => void
  message: (message: string, options?: ToastOptions) => string | number
  custom: (jsx: any, options?: ToastOptions) => string | number
}

// Create toast object with methods
const toastObject = {
  success: (message: string, options?: ToastOptions) => dismissAndShow('success', message, options),
  error: (message: string, options?: ToastOptions) => dismissAndShow('error', message, options),
  warning: (message: string, options?: ToastOptions) => dismissAndShow('warning', message, options),
  info: (message: string, options?: ToastOptions) => dismissAndShow('info', message, options),
  loading: (message: string, options?: ToastOptions) => dismissAndShow('loading', message, options),
  promise: <T>(promise: Promise<T>, options?: any) => {
    sonnerToast.dismiss()
    return sonnerToast.promise(promise, options)
  },
  dismiss: (id?: string | number) => {
    if (id) {
      return sonnerToast.dismiss(id)
    }
    // If no ID provided, dismiss all
    return sonnerToast.dismiss()
  },
  // Keep all other methods available
  message: (message: string, options?: ToastOptions) => dismissAndShow('message', message, options),
  custom: (jsx: any, options?: ToastOptions) => {
    sonnerToast.dismiss()
    return sonnerToast.custom(jsx, options)
  },
}

// Make toast callable as a function (default export behavior)
const toastFn = (message: string, options?: ToastOptions) => {
  sonnerToast.dismiss()
  return sonnerToast(message, options)
}

// Attach all methods to the function and cast to proper type
const toast = Object.assign(toastFn, toastObject) as ToastFunction

export { toast }

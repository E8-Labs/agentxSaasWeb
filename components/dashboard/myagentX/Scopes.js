// Check if we're in production environment
const isProduction =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    : process.env.NODE_ENV === 'production'

// Base scopes (always included)
const baseScopes = [
  'openid email profile https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.calendars.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.events.owned',
]

// Gmail scopes (only in test environment)
const gmailScopes = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly', // Required for Gmail watch/push notifications
]

// Export scopes based on environment
export const Scopes = isProduction
  ? baseScopes
  : [...baseScopes, ...gmailScopes]

// export const Scopes = [
//     "openid",
//     "email",
//     "profile",
//     "https://www.googleapis.com/auth/calendar",
//     "https://www.googleapis.com/auth/calendar.calendars.readonly",
//     "https://www.googleapis.com/auth/calendar.events",
//     "https://www.googleapis.com/auth/calendar.events.owned",
//     "https://www.googleapis.com/auth/gmail.send",
//     "https://www.googleapis.com/auth/gmail.readonly",
// ];

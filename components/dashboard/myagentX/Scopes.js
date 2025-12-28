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

// Gmail send scope (available in all environments - approved)
const gmailSendScope = 'https://www.googleapis.com/auth/gmail.send'

// Gmail readonly scope (only in test environment - not approved for production)
const gmailReadonlyScope = 'https://www.googleapis.com/auth/gmail.readonly'

// Export scopes based on environment
// Production: base scopes + gmail.send (but NOT gmail.readonly)
// Test: base scopes + gmail.send + gmail.readonly
export const Scopes = isProduction
  ? [...baseScopes, gmailSendScope]
  : [...baseScopes, gmailSendScope, gmailReadonlyScope]

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

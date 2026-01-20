/**
 * Structured logging utility for plan-related operations
 * Provides consistent logging format and can be easily disabled/enabled
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
}

const LOG_CATEGORIES = {
  PLAN_FETCH: 'PLAN_FETCH',
  PLAN_SELECTION: 'PLAN_SELECTION',
  USER_CONTEXT: 'USER_CONTEXT',
  API_CALL: 'API_CALL',
}

// Enable/disable logging (set to false in production if needed)
const ENABLE_LOGGING = process.env.NODE_ENV !== 'production' || true

/**
 * Format log entry with timestamp and structured data
 */
const formatLog = (level, category, message, metadata = {}) => {
  const timestamp = new Date().toISOString()
  return {
    timestamp,
    level,
    category,
    message,
    ...metadata,
  }
}

/**
 * Log to console with structured format
 */
const log = (level, category, message, metadata = {}) => {
  if (!ENABLE_LOGGING) return

  const logEntry = formatLog(level, category, message, metadata)
  
  // Use appropriate console method based on level
  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(`[${level}][${category}] ${message}`, metadata)
      break
    case LOG_LEVELS.WARN:
      console.warn(`[${level}][${category}] ${message}`, metadata)
      break
    case LOG_LEVELS.DEBUG:
      console.debug(`[${level}][${category}] ${message}`, metadata)
      break
    default:
      console.log(`[${level}][${category}] ${message}`, metadata)
  }
}

export const planLogger = {
  error: (category, message, metadata) => log(LOG_LEVELS.ERROR, category, message, metadata),
  warn: (category, message, metadata) => log(LOG_LEVELS.WARN, category, message, metadata),
  info: (category, message, metadata) => log(LOG_LEVELS.INFO, category, message, metadata),
  debug: (category, message, metadata) => log(LOG_LEVELS.DEBUG, category, message, metadata),
  
  // Convenience methods for common operations
  logEffectiveUser: (effectiveUser, context) => {
    planLogger.info(LOG_CATEGORIES.USER_CONTEXT, 'Effective user determined', {
      effectiveUserId: effectiveUser?.id,
      effectiveUserRole: effectiveUser?.userRole,
      context,
      hasSelectedUser: !!effectiveUser?.isSelectedUser,
    })
  },
  
  logPlanFetch: (endpoint, userId, userRole) => {
    planLogger.info(LOG_CATEGORIES.PLAN_FETCH, 'Fetching plans', {
      endpoint,
      userId,
      userRole,
    })
  },
  
  logPlanFetchSuccess: (endpoint, planCount) => {
    planLogger.info(LOG_CATEGORIES.PLAN_FETCH, 'Plans fetched successfully', {
      endpoint,
      planCount,
    })
  },
  
  logPlanFetchError: (endpoint, error) => {
    planLogger.error(LOG_CATEGORIES.PLAN_FETCH, 'Failed to fetch plans', {
      endpoint,
      error: error?.message || String(error),
    })
  },
}

export { LOG_LEVELS, LOG_CATEGORIES }

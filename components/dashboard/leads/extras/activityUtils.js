import { Smile, Frown, Meh, Flame, Sun, Snowflake, MessageSquareDot } from 'lucide-react'
import { callStatusColors } from '@/constants/Constants'

/**
 * Get the icon path for a communication type
 * @param {Object} item - Activity item
 * @returns {string} Icon path
 */
export const getCommunicationTypeIcon = (item) => {
  // Check if it's a dialer call (callOrigin === 'Dialer' or isWebCall === false for calls)
  const isDialerCall = item.callOrigin === 'Dialer' || (item.communicationType === 'call' && item.isWebCall === false)

  if (item.communicationType == 'sms') {
    return <MessageSquareDot size={18} color="#000000" />
  } else if (item.communicationType == 'email') {
    return '/otherAssets/email.png'
  } else if (item.communicationType == 'call' || isDialerCall) {
    return '/otherAssets/callIcon.png'
  } else if (item.communicationType == 'web') {
    return '/otherAssets/webhook2.svg'
  } else return '/otherAssets/callIcon.png'
}

/**
 * Get the outcome text for an activity item
 * @param {Object} item - Activity item
 * @returns {string} Outcome text
 */
export const getOutcome = (item) => {
  // console.log("End call reason passing is", item)
  if (item.communicationType == 'sms') {
    // return 'Text Sent'
    if (item?.endCallReason === "sms_failed" || item?.status!== "completed") {
      return "Text Failed"
    } else if (item?.endCallReason === "sms_sent" || item?.status==="completed") {
      return "Text Sent"
    } else {
      return "Text Sent"
    }
  } else if (item.communicationType == 'email') {
    if (item?.endCallReason === "email_sent" || item?.status==="completed"){
      return "Email Sent"
    } else if (item?.endCallReason === "email_failed" || item?.status!== "completed"){
      return "Email Failed"
    } else {
      // return item?.callOutcome
      return "Email Sent"
    }
    // return 'Email Sent'
  } else if (item.callOutcome) {
    return item?.callOutcome
  } else {
    return 'Ongoing'
  }
}

/**
 * Get the color for an outcome badge
 * @param {Object} item - Activity item
 * @returns {string} Color hex code
 */
export const getOutcomeColor = (item) => {
  const color =
    callStatusColors[
    Object.keys(callStatusColors).find(
      (key) =>
        key.toLowerCase() === (item?.callOutcome || '').toLowerCase(),
    )
    ] || '#000'

  return color
}

/**
 * Get sentiment icon component
 * @param {string} sentiment - Sentiment value
 * @returns {ReactNode|null} Sentiment icon component
 */
export const getSentimentIcon = (sentiment) => {
  if (!sentiment) return null
  const sentimentLower = sentiment.toLowerCase()
  if (sentimentLower.includes('positive') || sentimentLower.includes('happy') || sentimentLower.includes('excited')) {
    return <Smile size={18} color="hsl(var(--brand-primary))" />
  } else if (sentimentLower.includes('negative') || sentimentLower.includes('angry') || sentimentLower.includes('frustrated')) {
    return <Frown size={18} color="hsl(var(--brand-primary))" />
  } else {
    return <Meh size={18} color="hsl(var(--brand-primary))" />
  }
}

/**
 * Get temperature icon component for activity tiles
 * @param {string} temperature - Temperature value
 * @returns {ReactNode|null} Temperature icon component
 */
export const getTemperatureIconForActivity = (temperature) => {
  if (!temperature) return null
  const tempLower = temperature.toLowerCase()
  if (tempLower.includes('hot')) {
    return <Flame size={18} color="hsl(var(--brand-primary))" />
  } else if (tempLower.includes('warm')) {
    return <Sun size={18} color="hsl(var(--brand-primary))" />
  } else if (tempLower.includes('cold')) {
    return <Snowflake size={18} color="hsl(var(--brand-primary))" />
  }
  return null
}

/**
 * Format next steps for tooltip display
 * @param {string|Array} nextSteps - Next steps data
 * @returns {string} Formatted next steps text
 */
export const formatNextStepsForTooltip = (nextSteps) => {
  if (!nextSteps) return 'No next steps'
  if (nextSteps === '[]') return 'No next steps'
  try {
    const steps = typeof nextSteps === 'string' ? JSON.parse(nextSteps) : nextSteps
    if (Array.isArray(steps) && steps.length > 0) {
      return steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')
    }
    return typeof nextSteps === 'string' ? nextSteps : 'No next steps'
  } catch {
    return typeof nextSteps === 'string' ? nextSteps : 'No next steps'
  }
}

/**
 * Format next steps for description field (textarea)
 * @param {string|Array} nextSteps - Next steps data
 * @returns {string} Formatted next steps text suitable for textarea
 */
export const formatNextStepsForDescription = (nextSteps) => {
  if (!nextSteps) return ''
  try {
    const steps = typeof nextSteps === 'string' ? JSON.parse(nextSteps) : nextSteps
    if (Array.isArray(steps) && steps.length > 0) {
      return steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')
    }
    return typeof nextSteps === 'string' ? nextSteps : ''
  } catch {
    return typeof nextSteps === 'string' ? nextSteps : ''
  }
}


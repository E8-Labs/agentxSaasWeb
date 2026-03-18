import { toast } from "@/utils/toast"
import { AuthToken } from "../agency/plan/AuthDetails"
import Apis from "../apis/Apis"
import axios from "axios"

//functiion to get cards list
export const getCardsList = async (selectedUser = null) => {
    try {
        // setGetCardLoader(true);
        let token = AuthToken()

        let ApiPath = Apis.getCardsList

        if (selectedUser) {
            ApiPath = `${ApiPath}?userId=${selectedUser.id}`
        }

        const response = await axios.get(ApiPath, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        console.log('response of fetch cards list', response)

        if (response) {
            if (response.data.status === true) {
                return response.data.data
            }
        }
    } catch (error) {
        toast.error('Error fetching cards list')
    } finally {
        // //console.log;
        // setGetCardLoader(false);
    }
}

/**
 * Returns display text for a feature. For the middle plan, "AI Powered iMessage" is shown as "AI Powered Text".
 * @param {{ text: string, subtext?: string }} feature - Feature object
 * @param {number} planIndex - Index of the plan (0-based)
 * @param {number} totalPlans - Total number of plans
 * @returns {string} Display text for the feature
 */
export const getFeatureDisplayText = (feature, planIndex, totalPlans) => {
  const text = feature?.text || ''
  const isMiddlePlan = totalPlans >= 3 && planIndex === 1
  if (isMiddlePlan && /ai\s+powered\s+imessage/i.test(text)) {
    return text.replace(/ai\s+powered\s+imessage/gi, 'AI Powered Text')
  }
  return text
}

/**
 * Reorders plan features so "AI Powered iMessage" is 6th and "AI Powered emails" is 7th.
 * @param {Array<{text: string, [key: string]: unknown}>} features - Plan features array
 * @returns {Array} Reordered features array
 */
export const reorderPlanFeatures = (features) => {
  if (!Array.isArray(features) || features.length < 7) return features

  const matchesIMessage = (text) =>
    /ai\s+powered\s+imessage/i.test(text || '')
  const matchesEmails = (text) =>
    /ai\s+powered\s+emails?/i.test(text || '')

  const iMessageIdx = features.findIndex((f) => matchesIMessage(f?.text))
  const emailsIdx = features.findIndex((f) => matchesEmails(f?.text))

  if (iMessageIdx === -1 && emailsIdx === -1) return features

  const withoutTargets = features.filter(
    (f, i) => i !== iMessageIdx && i !== emailsIdx
  )
  const aiIMessage = iMessageIdx >= 0 ? features[iMessageIdx] : null
  const aiEmails = emailsIdx >= 0 ? features[emailsIdx] : null

  const result = [
    ...withoutTargets.slice(0, 5),
    ...(aiIMessage ? [aiIMessage] : []),
    ...(aiEmails ? [aiEmails] : []),
    ...withoutTargets.slice(5),
  ]
  return result
}

export const getCardImage = (item) => {
    if (item.brand === 'visa') {
        return '/svgIcons/Visa.svg'
    } else if (item.brand === 'Mastercard') {
        return '/svgIcons/mastercard.svg'
    } else if (item.brand === 'amex') {
        return '/svgIcons/Amex.svg'
    } else if (item.brand === 'discover') {
        return '/svgIcons/Discover.svg'
    } else if (item.brand === 'dinersClub') {
        return '/svgIcons/DinersClub.svg'
    }
}

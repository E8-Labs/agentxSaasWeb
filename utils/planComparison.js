/**
 * Universal plan comparison for upgrade/downgrade/same.
 * Must stay in sync with agentxapis/utils/planComparison.js so frontend and backend (emails) agree.
 */

const BILLING_CYCLE_RANK = {
  monthly: 1,
  quarterly: 2,
  'half-yearly': 3,
  yearly: 4,
}

/**
 * Get tier rank from plan title/name/planType using includes (order: scale, growth, starter, free).
 * @param {Object} plan - Plan with title, name, or planType
 * @returns {number} 0=free, 1=starter, 2=growth, 3=scale, -1=unknown
 */
function getTierRank(plan) {
  const s = (
    (plan?.title ?? plan?.planType ?? plan?.name ?? '')
  ).toLowerCase()
  if (s.includes('scale')) return 3
  if (s.includes('growth')) return 2
  if (s.includes('starter')) return 1
  if (s.includes('free')) return 0
  return -1
}

function getBillingRank(plan) {
  const cycle = (
    plan?.billingCycle ?? plan?.duration ?? 'monthly'
  ).toLowerCase()
  return BILLING_CYCLE_RANK[cycle] ?? 1
}

function getPrice(plan) {
  return (
    plan?.discountedPrice ??
    plan?.discountPrice ??
    plan?.originalPrice ??
    plan?.price ??
    0
  )
}

function getPlanId(plan) {
  const id = plan?.id ?? plan?.planId
  return id == null ? NaN : Number(id)
}

/**
 * Returns whether the move from currentPlan to targetPlan is an upgrade, downgrade, or same.
 * Tie-breaker when tier/billing/price are equal: plan id (lower id = lower plan → downgrade).
 *
 * For subaccounts (skipTierFromName: true): do NOT use plan name/title for tier; compare only
 * billing cycle → price → plan id (order). For agency/AgentX use tier from name when present.
 *
 * @param {Object} currentPlan - User's current plan
 * @param {Object} targetPlan - Plan user is moving to
 * @param {{ skipTierFromName?: boolean }} [options] - skipTierFromName: true for subaccount (no name-based tier)
 * @returns {'upgrade'|'downgrade'|'same'}
 */
export function getPlanChangeDirection(currentPlan, targetPlan, options = {}) {
  if (!currentPlan || !targetPlan) return 'same'

  const skipTier = options.skipTierFromName === true

  const currentId = getPlanId(currentPlan)
  const targetId = getPlanId(targetPlan)
  if (String(currentId) === String(targetId) || (Number.isNaN(currentId) && Number.isNaN(targetId))) {
    return 'same'
  }

  const currentBilling = getBillingRank(currentPlan)
  const targetBilling = getBillingRank(targetPlan)
  const currentPrice = getPrice(currentPlan)
  const targetPrice = getPrice(targetPlan)

  if (!skipTier) {
    const currentTier = getTierRank(currentPlan)
    const targetTier = getTierRank(targetPlan)
    const compareTierThenBillingThenPrice = () => {
      if (targetTier > currentTier) return 'upgrade'
      if (targetTier < currentTier) return 'downgrade'
      if (targetBilling > currentBilling) return 'upgrade'
      if (targetBilling < currentBilling) return 'downgrade'
      if (targetPrice > currentPrice) return 'upgrade'
      if (targetPrice < currentPrice) return 'downgrade'
      if (targetId < currentId) return 'downgrade'
      if (targetId > currentId) return 'upgrade'
      return 'same'
    }
    if (currentTier >= 0 && targetTier >= 0) {
      return compareTierThenBillingThenPrice()
    }
  }

  // Tier unknown or skipTier (subaccount): billing → price → plan id only
  if (targetBilling > currentBilling) return 'upgrade'
  if (targetBilling < currentBilling) return 'downgrade'
  if (targetPrice > currentPrice) return 'upgrade'
  if (targetPrice < currentPrice) return 'downgrade'
  if (targetId < currentId) return 'downgrade'
  if (targetId > currentId) return 'upgrade'
  return 'same'
}

import { useCallback, useEffect } from 'react'

import { useUser } from './redux-hooks'
import { usePlanCapabilities } from './use-plan-capabilities'

/**
 * Hook to monitor plan changes and react accordingly
 * Useful for handling subscription upgrades, downgrades, cancellations
 */
export const usePlanMonitor = () => {
  const { user, updateProfile } = useUser()
  const planCapabilities = usePlanCapabilities()

  // Handle plan upgrade
  const handlePlanUpgrade = useCallback(
    (newPlanData) => {
      console.log('Plan upgraded:', newPlanData)

      // Update user profile with new plan data
      updateProfile({
        plan: newPlanData.plan,
        planCapabilities: newPlanData.planCapabilities,
        currentUsage: newPlanData.currentUsage,
      })

      // Could trigger success notifications, feature unlocks, etc.
      window.dispatchEvent(
        new CustomEvent('planUpgraded', { detail: newPlanData }),
      )
    },
    [updateProfile],
  )

  // Handle plan downgrade
  const handlePlanDowngrade = useCallback(
    (newPlanData) => {
      console.log('Plan downgraded:', newPlanData)

      // Update user profile
      updateProfile({
        plan: newPlanData.plan,
        planCapabilities: newPlanData.planCapabilities,
        currentUsage: newPlanData.currentUsage,
      })

      // Could trigger warnings about feature limitations
      window.dispatchEvent(
        new CustomEvent('planDowngraded', { detail: newPlanData }),
      )
    },
    [updateProfile],
  )

  // Handle plan cancellation
  const handlePlanCancellation = useCallback(
    (cancellationData) => {
      console.log('Plan cancelled:', cancellationData)

      // Update user profile to reflect cancellation
      updateProfile({
        plan: null,
        planCapabilities: null,
        currentUsage: cancellationData.currentUsage,
      })

      // Trigger plan cancellation event
      window.dispatchEvent(
        new CustomEvent('planCancelled', { detail: cancellationData }),
      )
    },
    [updateProfile],
  )

  // Monitor for external plan changes (webhooks, API responses, etc.)
  useEffect(() => {
    // Listen for plan change events from external sources
    const handleExternalPlanChange = (event) => {
      const { type, data } = event.detail

      switch (type) {
        case 'upgrade':
          handlePlanUpgrade(data)
          break
        case 'downgrade':
          handlePlanDowngrade(data)
          break
        case 'cancel':
          handlePlanCancellation(data)
          break
        default:
          console.log('Unknown plan change type:', type)
      }
    }

    // Listen for external plan change notifications
    window.addEventListener('externalPlanChange', handleExternalPlanChange)

    return () => {
      window.removeEventListener('externalPlanChange', handleExternalPlanChange)
    }
  }, [handlePlanUpgrade, handlePlanDowngrade, handlePlanCancellation])

  // Update storage bridge when plan changes
  useEffect(() => {
    if (user?.plan) {
      // Ensure localStorage stays in sync with Redux
      const storageUser = {
        token: user.token || localStorage.getItem('User')?.token,
        user: user,
      }
      localStorage.setItem('User', JSON.stringify(storageUser))
    }
  }, [user?.plan, user?.planCapabilities, user?.currentUsage])

  return {
    // Plan change handlers
    handlePlanUpgrade,
    handlePlanDowngrade,
    handlePlanCancellation,

    // Current plan info
    currentPlan: user?.plan,
    planCapabilities: user?.planCapabilities,
    currentUsage: user?.currentUsage,

    // Helper to manually trigger plan refresh
    refreshPlanData: useCallback(() => {
      // Could trigger a plan data refresh from API
      window.dispatchEvent(new CustomEvent('refreshPlanData'))
    }, []),
  }
}

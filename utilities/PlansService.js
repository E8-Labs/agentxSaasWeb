import axios from 'axios'

import Apis from '@/components/apis/Apis'

/**
 * Plans Service - Centralized service for fetching plans from the API
 */
class PlansService {
  /**
   * Get plans based on category and context
   * @param {string} category - 'regular' or 'xbar'
   * @param {string} context - 'billing', 'onboarding', 'simple', 'admin', 'default'
   * @param {boolean} includeTrial - Include trial plans
   * @param {string} environment - 'production' or 'test'
   * @returns {Promise<Array>} Plans array
   */
  static async getPlans(
    category = 'regular',
    context = 'default',
    includeTrial = false,
    environment = 'test',
  ) {
    try {
      const params = new URLSearchParams()
      params.append('category', category)
      params.append('context', context)
      params.append('environment', environment)

      if (includeTrial) {
        params.append('includeTrial', 'true')
      }

      const response = await axios.get(
        `${Apis.getPlans}?${params.toString()}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json',
          },
        },
      )

      console.log('Plans response is ', response.data.data)
      if (response.data && Array.isArray(response.data.data)) {
        return this.transformPlansData(response.data.data, context)
      }
      return []
    } catch (error) {
      console.error('Error fetching plans:', error)
      return this.getFallbackPlans(context, includeTrial)
    }
  }

  /**
   * Transform API response to match existing component expectations
   */
  static transformPlansData(apiPlans, context) {
    return apiPlans.map((plan) => {
      // Base transformation
      const transformed = {
        id: plan.id,
        mints: plan.minutes || plan.mints,
        calls: plan.calls,
        details: plan.details,
        originalPrice: plan.originalPrice || plan.price,
        discountPrice: plan.discountPrice || plan.price,
        planStatus: plan.planStatus || plan.status,
        status: plan.status,
      }

      // Context-specific transformations
      if (context === 'onboarding' && plan.isTrial) {
        transformed.startFreeLabel = 'Free'
        transformed.trial = plan.trial || '7 Day Trial'
        transformed.isTrial = plan.isTrial
        transformed.discountPrice = 'Free Trial'
        transformed.planStatus = 'Free'
      }

      if (context === 'simple') {
        return {
          name: plan.name || `${plan.minutes}min Plan`,
          mins: plan.minutes,
          calls: plan.calls,
          price: `$${plan.discountPrice || plan.price}`,
        }
      }

      if (context === 'admin') {
        return {
          id: plan.id,
          plan: plan.planType || `Plan${plan.minutes}`,
        }
      }

      return transformed
    })
  }

  /**
   * Fallback plans if API fails
   */
  static getFallbackPlans(context, includeTrial = false) {
    const basePlans = [
      {
        id: 1,
        mints: 30,
        calls: 125,
        details: 'Great for trying out AI sales agents.',
        originalPrice: '',
        discountPrice: '45',
        planStatus: '',
        status: '',
      },
      {
        id: 2,
        mints: 120,
        calls: '500',
        details: 'Perfect for lead updates and engagement.',
        originalPrice: '165',
        discountPrice: '99',
        planStatus: '40%',
        status: '',
      },
      {
        id: 3,
        mints: 360,
        calls: '1500',
        details: 'Perfect for lead reactivation and prospecting.',
        originalPrice: '540',
        discountPrice: '299',
        planStatus: '50%',
        status: 'Popular',
      },
      {
        id: 4,
        mints: 720,
        calls: '5k',
        details: 'Ideal for teams and reaching new GCI goals.',
        originalPrice: '1200',
        discountPrice: '599',
        planStatus: '50%',
        status: 'Best Value',
      },
    ]

    if (context === 'simple') {
      return [
        { name: 'Starter', mins: '125', calls: '500', price: '$99' },
        { name: 'Growth', mins: '360', calls: '1,500', price: '$299' },
        { name: 'Scale', mins: '800', calls: '5,000', price: '$599' },
      ]
    }

    if (context === 'admin') {
      return [
        { id: 1, plan: 'trail' },
        { id: 2, plan: 'Plan30' },
        { id: 3, plan: 'Plan120' },
        { id: 4, plan: 'Plan360' },
        { id: 5, plan: 'Plan720' },
      ]
    }

    if (context === 'onboarding' && includeTrial) {
      return [
        {
          id: 1,
          startFreeLabel: 'Free',
          mints: 30,
          calls: 125,
          isTrial: true,
          trial: '7 Day Trial',
          details: 'Perfect to start for free, then $45 to continue.',
          originalPrice: '45',
          discountPrice: 'Free Trial',
          planStatus: 'Free',
          status: '',
        },
        ...basePlans.slice(1),
      ]
    }

    return basePlans
  }

  /**
   * Get cached plans with fallback to API
   */
  static async getCachedPlans(
    cacheKey,
    category,
    context,
    includeTrial = false,
  ) {
    try {
      // Try to get from localStorage first
      // const cached = localStorage.getItem(cacheKey);
      // if (cached) {
      //   console.log('Found cached plans', cached)
      //   const parsedCache = JSON.parse(cached);
      //   // Check if cache is less than 5 minutes old
      //   const cacheTime = parsedCache.timestamp;
      //   const now = Date.now();
      //   if (now - cacheTime < 5 * 60 * 1000) { // 5 minutes
      //     return parsedCache.data;
      //   }
      // }

      console.log('Not cached plans')
      // Fetch fresh data from API
      const plans = await this.getPlans(category, context, includeTrial)
      console.log('Found plans from server', plans)
      // Cache the result
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: plans,
          timestamp: Date.now(),
        }),
      )

      return plans
    } catch (error) {
      console.error('Error in getCachedPlans:', error)
      return this.getFallbackPlans(context, includeTrial)
    }
  }
}

export default PlansService

export const duration = [
  {
    id: 1,
    title: 'Monthly',
    save: '',
  },
  {
    id: 2,
    title: 'Quarterly',
    save: '20%',
  },
  {
    id: 3,
    title: 'Yearly',
    save: '30%',
  },
]

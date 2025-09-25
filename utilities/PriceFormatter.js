/**
 * Price formatting utilities for consistent currency display
 */

/**
 * Format a price value with proper currency symbol and localization
 * @param {number|string} price - The price value to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD', locale = 'en-US') => {
  if (price === null || price === undefined || price === '') {
    return '$0';
  }

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return '$0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericPrice);
  } catch (error) {
    // Fallback to simple formatting if Intl is not supported
    return `$${numericPrice.toFixed(2)}`;
  }
};

/**
 * Format price for display in modals and UI components
 * @param {number|string} price - The price value
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted price string
 */
export const formatDisplayPrice = (price, currency = 'USD') => {
  return formatPrice(price, currency, 'en-US');
};

/**
 * Format price with thousands separator for large amounts
 * @param {number|string} price - The price value
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted price string with thousands separator
 */
export const formatPriceWithSeparator = (price, currency = 'USD') => {
  if (price === null || price === undefined || price === '') {
    return '$0';
  }

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return '$0';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice);
  } catch (error) {
    // Fallback to simple formatting
    return `$${numericPrice.toLocaleString()}`;
  }
};

/**
 * Calculate total price based on billing cycle
 * @param {Object} plan - Plan object with price and billing cycle
 * @returns {string} Formatted total price
 */
export const calculateTotalPrice = (plan) => {
  if (!plan) {
    return '$0';
  }

  const price = plan.discountedPrice || plan.discountPrice || plan.originalPrice || 0;
  const billingCycle = plan.billingCycle || plan.duration;
  
  let totalPrice = price;
  
  if (billingCycle === 'monthly') {
    totalPrice = price;
  } else if (billingCycle === 'quarterly') {
    totalPrice = price * 3;
  } else if (billingCycle === 'yearly') {
    totalPrice = price * 12;
  }

  return formatDisplayPrice(totalPrice);
};

/**
 * Format price for billing cycle display
 * @param {Object} plan - Plan object with price and billing cycle
 * @returns {string} Formatted price string
 */
export const formatBillingPrice = (plan) => {
  if (!plan) {
    return '$0';
  }

  const price = plan.discountedPrice || plan.discountPrice || plan.originalPrice || 0;
  const billingCycle = plan.billingCycle || plan.duration;
  
  let multiplier = 1;
  if (billingCycle === 'quarterly') {
    multiplier = 3;
  } else if (billingCycle === 'yearly') {
    multiplier = 12;
  }

  const totalPrice = price * multiplier;
  return formatDisplayPrice(totalPrice);
};

/**
 * Get month count from billing cycle
 * @param {string} billingCycle - Billing cycle string
 * @returns {number} Number of months
 */
export const getMonthCountFromBillingCycle = (billingCycle) => {
  switch (billingCycle) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 3;
    case 'yearly':
      return 12;
    default:
      return 1;
  }
};

/**
 * Format price with billing cycle context
 * @param {Object} plan - Plan object
 * @returns {string} Formatted price with billing context
 */
export const formatPriceWithBilling = (plan) => {
  if (!plan) {
    return '$0';
  }

  const price = plan.discountedPrice || plan.discountPrice || plan.originalPrice || 0;
  const billingCycle = plan.billingCycle || plan.duration;
  const monthCount = getMonthCountFromBillingCycle(billingCycle);
  
  const totalPrice = price * monthCount;
  return formatDisplayPrice(totalPrice);
};

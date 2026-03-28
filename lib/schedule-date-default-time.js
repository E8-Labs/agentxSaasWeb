/**
 * Local wall-clock time as "HH:mm" (24h). Use when a user picks a calendar date
 * so the time defaults to "now" in their timezone (same idea as Task Board due date).
 *
 * @param {Date} [referenceDate=new Date()] - Moment to read hours/minutes from (defaults to now).
 * @returns {string} e.g. "07:23"
 */
export function getLocalTimeHHmm(referenceDate = new Date()) {
  const d = referenceDate
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

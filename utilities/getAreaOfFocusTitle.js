/**
 * Get the area of focus title based on userType
 * @param {string} userType - The user type (e.g., 'RealEstateAgent', 'SalesDevRep', etc.)
 * @returns {string} - The area of focus title for the given user type
 */
export function getAreaOfFocusTitle(userType) {
  const userTypeMap = {
    RealEstateAgent: 'What area of real estate do you focus on?',
    SalesDevRep: 'What area of sales do you focus on?',
    SolarRep: 'What area of solar do you focus on?',
    InsuranceAgent: 'What area of insurance do you focus on?',
    MarketerAgent: 'What area of marketing do you focus on?',
    RecruiterAgent: 'What industries do you specialize in?',
    TaxAgent: 'What type of clients do you primarily serve?',
    DebtCollectorAgent: 'What type of clients do you primarily serve?',
    MedSpaAgent: 'What types of services do you primarily offer',
    LawAgent: 'What area of law do you primarily practice?',
    LoanOfficerAgent: 'What type of loans do you primarily work with?',
    ReceptionAgent: 'What area do you focus on?',
    GeneralAgent: 'What area do you focus on?',
    WebsiteAgent: 'How would you use AssignX?',
  }

  return userTypeMap[userType] || 'What area do you focus on?'
}

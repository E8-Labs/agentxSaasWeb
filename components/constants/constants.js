export const KycCategory = {
  CategoryNeeds: "need",
  CategoryMotivation: "motivation",
  CategoryUrgency: "urgency",
};

export const SnackMessageTitles = {
  ErrorTitlePhoneRequiredLeadImport: "Phone number required",
  ErrorMessagePhoneRequiredLeadImport: "Can't upload leads without a phone",
  ErrorTitleFirstNameRequiredLeadImport: "First Name required",
  ErrorMessageFirstNameRequiredLeadImport:
    "Can't upload leads without a First Name",
};

export const BatchStatus = {
  // Pending: "Pending",
  Active: "Active",
  Paused: "Paused",
  PausedForNonPayment: "PausedForNonPayment",
  PausedForUpdateCadence: "PausedForUpdateCadence",
  Completed: "Completed", // the rest of the cadence for that
};

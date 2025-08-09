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
  PausedForNoPhoneNumber: "PausedForNoPhoneNumber",
  Completed: "Completed", // the rest of the cadence for that
};


export const stagesDropdown = [
  {
    id: 1,
    title: "Rename",
    img: "/assets/editPen.png",
  },
  {
    id: 2,
    title: "Color",
    img: "",
  },
  {
    id: 1,
    title: "Configure",
    img: "",
  },
  {
    id: 3,
    title: "Delete",
    img: ""
  }
]


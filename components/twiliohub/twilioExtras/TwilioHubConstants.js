// customer type
export const customerType = [
    {
        id: 1,
        title: "Direct Customers",
        description: "My business uses twilio to communicate internally or with our customers",
        type: "direct"
    },
    {
        id: 2,
        title: "ISV Reseller or partner",
        description: "My business uses twilio in a product that i sell to customers",
        type: "reseller"
    },
    {
        id: 3,
        title: "ISDN Telegram Service Provider",
        description: "My business uses twilio in a product that i sell to customers",
        type: ""
    },
]

//business types
export const businessTypesArray = [
    { id: 1, title: "LLC - Limited Liability Company" },
    { id: 2, title: "Corporation" },
    { id: 3, title: "Non-Profit" },
    { id: 4, title: "Sole Proprietorship" },
    { id: 5, title: "Partnership" },
    { id: 6, title: "Government" },
    { id: 7, title: "Public Company" },
    { id: 8, title: "Private Company" },
    { id: 9, title: "Association" }
];

//bussiness region area
export const bussinessRegionArea = [
    {
        id: 1,
        areaName: "US"
    },
    {
        id: 2,
        areaName: "US, CA"
    },
    {
        id: 3,
        areaName: "US, GB,IN"
    },
    // {
    //   id: 4,
    //   areaName: "Europe"
    // },
    // {
    //   id: 5,
    //   areaName: "Latin America"
    // },
    // {
    //   id: 6,
    //   areaName: "USA & Canada"
    // },
]

//industry type array
export const industriesTypeArray = [
    { id: 1, title: "Real Estate" },
    { id: 2, title: "Healthcare" },
    { id: 3, title: "Retail" },
    { id: 4, title: "Finance" },
    { id: 5, title: "Insurance" },
    { id: 6, title: "Technology" },
    { id: 7, title: "Telecommunications" },
    { id: 8, title: "Hospitality" },
    { id: 9, title: "Education" },
    { id: 10, title: "Transportation" },
    { id: 11, title: "E-Commerce" },
    { id: 12, title: "Entertainment" },
    { id: 13, title: "Non-Profit" }
];

//registeration Id type
export const registrationIdType = [
    { id: 1, title: "EIN - Employer Identification Number (U.S.)" },
    { id: 2, title: "DUNS - Dun & Bradstreet Number" },
    { id: 3, title: "LEI - Legal Entity Identifier" },
    { id: 4, title: "VAT - Value Added Tax ID (for EU)" },
    { id: 5, title: "CRN - Company Registration Number (UK)" },
    { id: 6, title: "Business Number - Generic fallback for some international regions" }
];

export const jobPositionArray = [
    { id: 1, title: "Owner" },
    { id: 2, title: "Compliance Officer" },
    { id: 3, title: "CEO" },
    { id: 4, title: "COO" },
    { id: 5, title: "CTO" },
    { id: 6, title: "Legal Counsel" },
    { id: 7, title: "Operations Manager" },
    { id: 8, title: "Customer Success Manager" },
    { id: 9, title: "IT Admin" },
    { id: 10, title: "Administrator" }
];

//list of callingrules
export const callingRules = [
    { id: 1, title: "Collect explicit opt-in when required" },
    { id: 2, title: "State the name of business and phone number within the first 30 seconds" },
    { id: 3, title: "Maintain a do-not-call list for customers who opt-out" },
    { id: 4, title: "Place calls between 8:00 am and 9:00 pm" },
];
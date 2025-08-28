export const PersistanceKeys = {
  LocalStorageUser: "User",
  LocalSavedAgentDetails: "agentDetails",
  LocalStorageUserLocation: "userLocation",
  LocalStorageCompleteLocation: "CompleteLocation",
  LeadsInBatch: "LeadsInBatch",
  CallsInBatch: "CallsInBatch",
  LocalStorageCampaignee: "CampaigneeSaved",
  AgencyUUID: "AgencyUUID",
  LocalStoragePipelines: "LocalStoragePipelines",
  RegisterDetails: "registerDetails",
  LocalStoredAgentsListMain: "localAgentDetails",
  LocalStorageSubPlan: "subPlan",
  LocalAllCalls: "LocalAllCalls",
  LocalScheduleCalls: "LocalScheduleCalls",
  LocalActiveCalls: "LocalActiveCalls",
  LocalVerificationCodes: "LocalVerificationCodes",
  LocalAffiliates: "LocalAffiliates",
  TestAiCredentials: "TestAiCredentials",
  GuadrailsList: "GuadrailsList",
  ObjectionsList: "ObjectionsList",
  //moving from admin to creat agent
  isFromAdminOrAgency: "isFromAdminOrAgency",
  leadUploadState: "leadUploadState",
  adminDashboardData: 'aadminDashboardData',
  SelectedAgent:'SelectedAgent',
  CalendarAddedByGoogle:"CalendarAddedByGoogle",
  
  //vapi-widget call popup
  showVapiModal: "showVapiModal",

  addCalendarScope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.settings.readonly",

  //twilio hub
  twilioHubData: "twilioHubData",

  //selected user for admin side
  selectedUser: "selectedUser",

  //stores ghl calendar
  localGHLs: "ghlCals",
  AssigningLeads:"AssigningLeads",
  LeadsAssigned:"LeadsAssigned",

  GlobalSupportUrl: process.env.NEXT_PUBLIC_REACT_APP_GlobalSupportUrl,
  GlobalConsultationUrl: process.env.NEXT_PUBLIC_REACT_APP_GlobalConsultationUrl,
  GlobalWebinarUrl: process.env.NEXT_PUBLIC_REACT_APP_GlobalWebinarUrl,
  ExternalCalendarLink: process.env.NEXT_PUBLIC_REACT_APP_ExternalCalendarLink,
  SupportWebinarUrl: process.env.NEXT_PUBLIC_REACT_APP_SupportWebinarUrl,
  ResourceHubUrl: process.env.NEXT_PUBLIC_REACT_APP_ResourceHubUrl,
  FeedbackFormUrl: process.env.NEXT_PUBLIC_REACT_APP_FeedbackFormUrl,
  HireTeamUrl: process.env.NEXT_PUBLIC_REACT_APP_HireTeamUrl,
  BillingSupportUrl: process.env.NEXT_PUBLIC_REACT_APP_BillingSupportUrl,
  // LocalStoredAgentsList
};
export const HowtoVideos = {
  Calendar: process.env.NEXT_PUBLIC_REACT_APP_Calendar,
  GettingStarted: process.env.NEXT_PUBLIC_REACT_APP_GettingStarted,
  KycQuestions: process.env.NEXT_PUBLIC_REACT_APP_KycQuestions,
  Leads: process.env.NEXT_PUBLIC_REACT_APP_Leads,
  LetsTalkDigits: process.env.NEXT_PUBLIC_REACT_APP_LetsTalkDigits,
  Pipeline: process.env.NEXT_PUBLIC_REACT_APP_Pipeline,
  script: process.env.NEXT_PUBLIC_REACT_APP_script,
  Tools: process.env.NEXT_PUBLIC_REACT_APP_MCPTool,
  WalkthroughWatched: process.env.NEXT_PUBLIC_REACT_APP_WalkthroughWatched,
  TwilioTrustHub: process.env.NEXT_PUBLIC_REACT_APP_TwilioTrustHub,
};

export const Constants = {
  GlobalPhoneNumber: "+16505403715",
};

export const XBarPlans = [
  {
    id: 1,
    type: "Starter",
    PlanTitle: "Starter | 250 mins",
    details: [
      `1 AgentX AI | 1hrs of Support`,
      `1 External Integration | 1 Calendar Integration`,
    ],
    originalPrice: "2,450",
    discountPrice: "997",
    planStatus: "40%",
    status: "",
  },
  {
    id: 2,
    type: "Professional",
    PlanTitle: "Professional | 750 mins",
    details: [
      `4 AgentX AI | 4hrs of Support`,
      `2 External Integration | 2 Calendar Integration`,
    ],
    originalPrice: "5,900",
    discountPrice: "2,997",
    planStatus: "50%",
    status: "Popular",
  },
  {
    id: 3,
    type: "Enterprise",
    PlanTitle: "Scale | 1500 mins",
    details: [
      "Dedicated Success Manager",
      `6 AgentX AI | 6hrs of Support`,
      `Unlimited External Integration | Calendar Integration`,
    ],
    originalPrice: "8,742",
    discountPrice: "3,497",
    planStatus: "60%",
    status: "Best Value",
  },
];

// export const isValidUrl = (url) => {
//   //console.log;
//   const urlPattern =
//     /^(https?:\/\/)?([\w-]+\.)+[a-zA-Z]{2,63}(\/[\w\-./?%&=]*)?$/;

//   return urlPattern.test(url);
// };

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

export const isValidYoutubeUrl = (url) => {
  //console.log;
  const urlPattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(.*)$/;

  return urlPattern.test(url);
};

export const fromatMessageName = (name) => {
  let formatedName = name?.slice(0, 1).toUpperCase(0) + name?.slice(1);
  // //console.log
  return formatedName;
};

export const AgentLLmModels = {
  Gpt4o: "gpt-4o",
  Gpt4oMini: "gpt-4-turbo",
  synthflow: "synthflow",
};

export const models = [
  {
    name: "AgentX",
    provider: "openai",
    value: "gpt-4.1-mini",
    icon: "/agentXOrb.gif",
    disabled: false,
    model: "gpt-4.1-mini", //'gpt-4.1-nano',
  },
  {
    name: "GPT-4o",
    provider: "openai",
    value: "gpt-4o-mini",
    icon: "/svgIcons/chatgptIcon.svg",
    disabled: false,
    model: "gpt-4o-mini",
  },
  {
    name: "GPT-4 Mini",
    value: "gpt-4.1-mini",
    provider: "openai",
    icon: "/svgIcons/chatgptIcon.svg",
    disabled: false,
    model: "gpt-4.1-nano",
  },
  // {
  //   name: "Grok",
  //   value: "grok",
  //   icon: "/svgIcons/grokIcon.svg",
  //   disabled: false,
  // },
  {
    name: "Llama", // mapped to groq
    value: "compound-beta",
    provider: "groq",
    icon: "/svgIcons/llamaIcon.svg",
    disabled: false,
    model: "compound-beta",
  },
  {
    name: "XAI",
    provider: "groq",
    value: "compound-beta-mini",
    icon: "/svgIcons/geminiIcon.svg",
    disabled: false,
    model: "compound-beta-mini",
  },
  {
    name: "DeepSeek",
    provider: "deep-seek",
    value: "deepseek-chat",
    icon: "/svgIcons/deepseekIcon.svg",
    model: "deepseek-chat",
    disabled: false,
  },
];


export const callStatusColors = {
  "Not Interested": "#FF4E4E",
  "Unknown": "#000000",
  "Busy": "#9E9E9E",
  "Call Back": "#2196F3",
  "Booked": "#4CAF50",
  "Hot Lead": "#FF5722",
  "Agent Goodbye": "#000000",
  "Hangup": "#673AB7",
  "Voicemail": "#009FB1",
  "No answer": "#FFC107",
  "Forwarded": "#000000",
  "Error": "#FF4E4E",
  "Failed": "#D32F2F",
};


export const termsAndConditionUrl = "https://www.myagentx.com/terms-and-condition";

export const privacyPollicyUrl = "https://www.myagentx.com/privacy-policy";
export const CancellationAndRefundUrl = "https://www.google.com/url?q=https://www.myagentx.com/cancellation-return-policy&sa=D&source=docs&ust=1751402335347404&usg=AOvVaw2aDueiwwhLkomUAiT_eTPT";




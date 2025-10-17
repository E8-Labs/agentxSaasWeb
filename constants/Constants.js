import moment from "moment";

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
  SelectedAgent: 'SelectedAgent',
  CalendarAddedByGoogle: "CalendarAddedByGoogle",
  isDefaultCadenceEditing: "isDefaultCadenceEditing",

  //vapi-widget call popup
  showVapiModal: "showVapiModal",

  addCalendarScope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.settings.readonly",

  //twilio hub
  twilioHubData: "twilioHubData",

  //selected user for admin side
  selectedUser: "selectedUser",

  //stores ghl calendar
  localGHLs: "ghlCals",
  AssigningLeads: "AssigningLeads",
  LeadsAssigned: "LeadsAssigned",

  SubaccoutDetails: "SubaccoutDetails",
  //link for agency copy link terms and conditions
  CopyLinkTerms: "https://www.assignx.ai/terms-and-condition",

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
      "Success Manager",
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
    responseTime: "750 ms",
  },
  {
    name: 'GPT-5',
    provider: 'openai',
    model: 'gpt-5',
    value: "gpt-5",
    icon: "/svgIcons/chatgptIcon.svg",
    disabled: false,
    responseTime: "1550 ms",
  },
  {
    name: "GPT-4o",
    provider: "openai",
    value: "gpt-4o-mini",
    icon: "/svgIcons/chatgptIcon.svg",
    disabled: false,
    model: "gpt-4o-mini",
    responseTime: "390 ms",
  },
  {
    name: "GPT-4 Mini",
    value: "gpt-4.1-mini",
    provider: "openai",
    icon: "/svgIcons/chatgptIcon.svg",
    disabled: false,
    model: "gpt-4.1-nano",
    responseTime: "770 ms",
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
    responseTime: "550 ms",
  },
  {
    name: "XAI",
    provider: "groq",
    value: "compound-beta-mini",
    icon: "/svgIcons/geminiIcon.svg",
    disabled: false,
    model: "compound-beta-mini",
    responseTime: "400 ms",
  },
  {
    name: "DeepSeek",
    provider: "deep-seek",
    value: "deepseek-chat",
    icon: "/svgIcons/deepseekIcon.svg",
    model: "deepseek-chat",
    disabled: false,
    responseTime: "400 ms",
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
export const next30Days = moment().add(30, "days").format("MM/DD/YYYY");


export const ScrollBarCss = () => {
  return "scrollbar scrollbar-track-scrollBarPurple scrollbar-thin scrollbar-thumb-transparent"
}


export const allIntegrations = [
  {
    title: "Mailchimp",
    url: "https://zapier.com/apps/mailchimp/integrations/myagentx",
    description:
      "Automatically nurture AssignX leads with targeted email campaigns in Mailchimp to stay top-of-mind.",
    icon: "/svgIcons/MailchimpIcon.svg",
  },
  {
    title: "ActiveCampaign",
    url: "https://zapier.com/apps/activecampaign/integrations/myagentx",
    description:
      "Send AssignX leads to ActiveCampaign to trigger automated email sequences and track engagement.",
    icon: "/svgIcons/ActiveCampaignIcon.svg",
  },
  {
    title: "ClickUp",
    url: "https://zapier.com/apps/clickup/integrations/myagentx",
    description:
      "Create follow-up tasks in ClickUp for AssignX leads to ensure no opportunity is missed.",
    icon: "/svgIcons/ClickUpIcon.svg",
  },
  {
    title: "Trello",
    url: "https://zapier.com/apps/trello/integrations/myagentx",
    description:
      "Organize AssignX leads into Trello boards for tracking follow-up actions and collaboration with your team.",
    icon: "/svgIcons/TrelloIcon.svg",
  },
  {
    title: "Asana",
    url: "https://zapier.com/apps/asana/integrations/myagentx",
    description:
      "Add tasks for AssignX lead follow-ups in Asana to keep your pipeline moving forward.",
    icon: "/svgIcons/AsanaIcon.svg",
  },
  {
    title: "Slack",
    url: "https://zapier.com/apps/slack/integrations/myagentx",
    description:
      "Receive instant updates in Slack when AssignX nurtures a lead or books an appointment.",
    icon: "/svgIcons/SlackIcon.svg",
  },
  {
    title: "Shopify",
    url: "https://zapier.com/apps/shopify/integrations/myagentx",
    description:
      "Sync Shopify customers to AssignX for personalized follow-ups and repeat business outreach.",
    icon: "/svgIcons/ShopifyIcon.svg",
  },
  {
    title: "Stripe",
    url: "https://zapier.com/apps/stripe/integrations/myagentx",
    description:
      "Automatically update AssignX lead profiles when payments are received through Stripe for nurturing upsell opportunities.",
    icon: "/svgIcons/StripeIcon.svg",
  },
  {
    title: "PayPal",
    url: "https://zapier.com/apps/paypal/integrations/myagentx",
    description:
      "Track PayPal transactions in AssignX and follow up with leads to build long-term relationships",
    icon: "/svgIcons/PayPalIcon.svg",
  },
  {
    title: "Google Sheets",
    url: "https://zapier.com/apps/google-sheets/integrations/myagentx",
    description:
      "Add new leads from Google Sheets to AssignX for AI-driven follow-ups and nurturing.",
    icon: "/svgIcons/GoogleSheetsIcon.svg",
  },
  {
    title: "Zoho",
    url: "https://zapier.com/apps/zoho-forms/integrations/myagentx",
    description:
      "Sync Zoho CRM leads with AssignX for automated follow-ups and timely engagement.",
    icon: "/svgIcons/ZohoIcon.svg",
  },
  {
    title: "FUB",
    url: "https://zapier.com/apps/follow-up-boss/integrations/myagentx",
    description:
      "Send FUB leads to AssignX to ensure consistent nurturing through AI-powered communication.",
    icon: "/svgIcons/FUBIcon.svg",
  },
  {
    title: "HubSpot",
    url: "https://zapier.com/apps/hubspot/integrations/myagentx",
    description:
      "Integrate HubSpot contacts with AssignX to automate follow-ups and streamline your pipeline.",
    icon: "/svgIcons/HubSpotIcon.svg",
  },
  {
    title: "Clio Grow",
    url: "https://zapier.com/apps/clio/integrations/myagentx",
    description:
      "Capture Clio Grow client leads and let AssignX handle the nurturing and scheduling.",
    icon: "/svgIcons/ClioGrowIcon.svg",
  },
  {
    title: "Close",
    url: "https://zapier.com/apps/close/integrations/myagentx",
    description:
      "Update Close opportunities with AssignX follow-up progress to streamline sales efforts.",
    icon: "/svgIcons/closeIcon.svg",
  },
  {
    title: "KV Core",
    url: "https://zapier.com/apps/kvcore/integrations/myagentx",
    description:
      "Send KV Core leads to AssignX to automate follow-ups and improve conversion rates.",
    icon: "/svgIcons/KVCoreIcon.svg",
  },
  {
    title: "Typeform",
    url: "https://zapier.com/apps/typeform/integrations/myagentx",
    description:
      "Capture Typeform responses as leads in AssignX for instant follow-up and nurturing.",
    icon: "/svgIcons/Typeform.svg",
  },
  {
    title: "JotForm",
    url: "https://zapier.com/apps/jotform/integrations/myagentx",
    description:
      "Add Jotform submissions to AssignX to kickstart AI-driven lead engagement and follow-up.",
    icon: "/svgIcons/JotformIcon.svg",
  },
  {
    title: "Facebook Ads (Instant form)",
    url: "https://zapier.com/apps/facebook-lead-ads/integrations/myagentx",
    description:
      "Sync Facebook leads to AssignX for immediate qualifying, follow-ups and lead nurturing. Speed to lead! ",
    icon: "/svgIcons/FacebookIcon.svg",
  },
  {
    title: "Wix forms",
    url: "https://zapier.com/apps/wix/integrations/myagentx",
    description:
      "Turn Wix form submissions into AssignX leads for automated nurturing and engagement.",
    icon: "/svgIcons/WixformsIcon.svg",
  },
  {
    title: "Calendly",
    url: "https://zapier.com/apps/calendly/integrations/myagentx",
    description:
      "Automatically update AssignX when appointments are scheduled in Calendly to ensure timely follow-ups.",
    icon: "/svgIcons/CalendlyIcon.svg",
  },
  {
    title: "Cal.com",
    url: "https://zapier.com/apps/calcom/integrations/myagentx",
    description:
      "Sync Cal.com bookings with AssignX for seamless scheduling and lead engagement.",
    icon: "/svgIcons/Cal.comIcon.svg",
  },
  {
    title: "GHL",
    url: "https://zapier.com/apps/leadconnector/integrations/myagentx",
    description:
      "Integrate with AssignX to streamline lead management, automate follow-ups, and boost conversions effortlessly.",
    icon: "/svgIcons/GHLIcon.svg",
  },
  {
    title: "Pipedrive",
    url: "https://zapier.com/apps/pipedrive/integrations/myagentx",
    description:
      "Connect Pipedrive with AssignX for seamless deal tracking and smart sales automation.",
    icon: "/svgIcons/PipedriveIcon.svg",
  },
  {
    title: "Salesforce",
    url: "https://zapier.com/apps/salesforce/integrations/myagentx",
    description:
      "Streamline Salesforce CRM with AssignX for effortless lead tracking and workflow automation.",
    icon: "/svgIcons/SalesforceIcon.svg",
  },
  {
    title: "Gmail",
    url: "",
    description:
      "Connect Gmail to send automated emails and Google Calendar to schedule events for seamless lead management and follow-ups.",
    icon: "/otherAssets/gmailIcon.png",
  },
];
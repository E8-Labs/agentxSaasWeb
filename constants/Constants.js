export const PersistanceKeys = {
  LocalStorageUser: "User",
  LocalSavedAgentDetails: "agentDetails",
  LocalStorageUserLocation: "userLocation",
  LocalStorageCompleteLocation: "CompleteLocation",
  LeadsInBatch: "LeadsInBatch",
  CallsInBatch: "CallsInBatch",
  LocalStorageCampaignee: "CampaigneeSaved",
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

  GlobalSupportUrl:
    "https://api.leadconnectorhq.com/widget/bookings/yk4um7vhmtrv4uaxmqpr",
  GlobalConsultationUrl:
    "https://api.leadconnectorhq.com/widget/booking/F1DtpvAR8fNf3RJM1akZ",
  GlobalWebinarUrl:
    "https://api.leadconnectorhq.com/widget/bookings/yk4um7vhmtrv4uaxmqpr",
  ExternalCalendarLink:
    "https://api.leadconnectorhq.com/widget/bookings/agentx/enterprise-plan",
  SupportWebinarUrl:
    "https://api.leadconnectorhq.com/widget/bookings/noah-support-webinar",
  // LocalStoredAgentsList
};
export const HowtoVideos = {
  Calendar:
    "https://www.blindcircle.com/agentxtest/uploads/howtos/2025-01-20_e98d0d1c-37ec-4989-8933-64a8c5df607f_howtos_Calendar",
  GettingStarted:
    "https://www.blindcircle.com/agentx/uploads/howtos/2025-01-20_3624c268-98ce-4a15-aeac-6f3bb7f67232_howtos_Getting_Started",
  KycQuestions:
    "https://www.blindcircle.com/agentx/uploads/howtos/2025-01-20_172645a9-7efe-4046-93f4-a227b2f4b56a_howtos_Kyc",
  Leads:
    "https://www.blindcircle.com/agentx/uploads/howtos/2025-01-20_64d906a8-b40a-421d-923b-cf1efb352d21_howtos_Leads",
  LetsTalkDigits:
    "https://www.blindcircle.com/agentx/uploads/howtos/2025-01-20_ddcecf9b-f489-43d3-bd7f-b0d13cf98644_howtos_LetsTalkDigits",
  Pipeline:
    "https://www.blindcircle.com/agentx/uploads/howtos/2025-01-20_497e2da3-8f32-44f2-b9ee-7231fa31e4cf_howtos_Pipeline",
  script:
    "https://www.blindcircle.com/agentx/uploads/howtos/2025-01-26_3ba0f5f5-3e15-4c6e-a9ce-1470fc0539b7_howtos_Leads",
};

export const Constants = {
  GlobalPhoneNumber: "+16505403715",
};

export const isValidUrl = (url) => {
  //console.log;
  const urlPattern =
    /^(https?:\/\/)?([\w-]+\.)+[a-zA-Z]{2,63}(\/[\w\-./?%&=]*)?$/;

  return urlPattern.test(url);
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

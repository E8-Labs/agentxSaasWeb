// const BasePath = process.env.NEXT_PUBLIC_REACT_APP_BASE_URL;

// //console.log;
const BasePath =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
    ? "https://apimyagentx.com/agentx/" //"https://www.blindcircle.com/agentx/"
    : "https://apimyagentx.com/agentxtest/"; //https://www.blindcircle.com

console.log(
  "Current environment is",
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT
);

const Apis = {
  getCalenders: `${BasePath}api/calendar/calendars`,
  register: `${BasePath}api/user/register`,
  LogIn: `${BasePath}api/user/login`,
  defaultData: `${BasePath}api/data/loadDefaualtData`,
  buildAgent: `${BasePath}api/agent/buildAgent`,
  DelAgent: `${BasePath}api/agent/deleteAgent`,
  findPhoneNumber: `${BasePath}api/agent/findPhoneNumbers`,
  purchaseNumber: `${BasePath}api/agent/purchasePhone`,
  userAvailablePhoneNumber: `${BasePath}api/agent/listUsersAvailablePhoneNumbers`,
  reassignNumber: `${BasePath}api/agent/releasePhoneNumber`,
  asignPhoneNumber: `${BasePath}api/agent/assignPhoneNumber`,
  getVoices: "https://fine-tuner.ai/api/1.1/wf/v2_voice_agent_voices",
  addKyc: `${BasePath}api/agent/addKyc`,
  deleteKyc: `${BasePath}api/agent/deleteKyc`,
  updateKYC: `${BasePath}api/agent/updateKyc`,
  getKYCs: `${BasePath}api/agent/getKycs`,
  getPipelines: `${BasePath}api/pipeline/getPipelines`,
  getPipelineById: `${BasePath}api/pipeline/getPipeline`,
  //paginating
  getLeadsInStage: `${BasePath}api/leads/getLeadsInStage`,
  updatePipeline: `${BasePath}api/pipeline/updatePipeline`,
  createPipeLineCadence: `${BasePath}api/pipeline/createPipelineCadence`,
  getAgentCadence: `${BasePath}api/pipeline/getAgentCadence`,
  deletePipeline: `${BasePath}api/pipeline/deletePipeline`,
  updateAgent: `${BasePath}api/agent/updateAgent`,
  updateSubAgent: `${BasePath}api/agent/updateSubAgent`,
  createLead: `${BasePath}api/leads/addLeads`,
  getLeads: `${BasePath}api/leads/getLeads`,
  getSheets: `${BasePath}api/leads/getSheets`,
  getAgents: `${BasePath}api/agent/getAgents`,
  assignLeadToPipeLine: `${BasePath}api/pipeline/assignLeadsToPipeline`,
  uniqueColumns: `${BasePath}api/leads/getUniqueColumns`,
  CheckEmail: `${BasePath}api/user/checkEmailExists`,
  CheckPhone: `${BasePath}api/user/checkPhoneNumber`,
  getCallLogs: `${BasePath}api/leads/callLogs`,
  getCallsInBatch: `${BasePath}api/pipeline/getCallsInABatch`,
  getLeadsInBatch: `${BasePath}api/pipeline/leadsInBatch`,

  getSheduledCallLogs: `${BasePath}api/pipeline/getScheduledCalls`,
  getAdminSheduledCallLogs: `${BasePath}api/admin/getScheduledCallsAdmin`,
  getAgentCallLogs: `${BasePath}api/agent/getAgentCallActivity`,
  pauseAgent: `${BasePath}api/pipeline/pauseAgentCadence`,
  resumeCalls: `${BasePath}api/pipeline/resumeAgentCadence`,
  getUniqueColumns: `${BasePath}api/leads/getUniqueColumns`,
  addSmartList: `${BasePath}api/leads/addSmartList`,
  delSmartList: `${BasePath}api/leads/deleteList`,
  addCustomStage: `${BasePath}api/pipeline/createStage`,
  deleteStage: `${BasePath}api/pipeline/deletePipelineStage`,
  UpdateStage: `${BasePath}api/pipeline/updateStage`,
  //advance setting
  addObjectionGuardrial: `${BasePath}api/agent/addObjectionGuardRail`,
  getObjectionGuardrial: `${BasePath}api/agent/getObjectionsAndGuardrails`,
  DelObjectGuard: `${BasePath}api/agent/deleteObjectionGuardRail`,
  UpdateAdvanceSetting: `${BasePath}api/agent/updateObjectionGuardRail`,
  reorderStages: `${BasePath}api/pipeline/reorderStages`,
  createPipeLine: `${BasePath}api/pipeline/createPipeline`,
  testAI: `${BasePath}api/agent/testAi`,
  addCalender: `${BasePath}api/calendar/createCalendar`,
  addLeadNote: `${BasePath}api/leads/addLeadNote`,
  getDashboardData: `${BasePath}api/agent/dashboard`,
  delLeadTag: `${BasePath}api/leads/deleteLeadTag`,
  //apis to add card & subscribe plan
  createSetupIntent: `${BasePath}api/user/createSetupIntent`,
  getPaymentIntent: `${BasePath}api/user/getSetupIntent`,
  addCard: `${BasePath}api/user/addPaymentMethod`,
  subscribePlan: `${BasePath}api/user/subscribePlan`,
  purchaseSupportPlan: `${BasePath}api/user/purchaseSupportPlan`,

  getLeadDetails: `${BasePath}api/leads/leadDetail`,
  getStagesList: `${BasePath}api/pipeline/getPipeline`,
  updateLeadStageApi: `${BasePath}api/leads/updateLeadStage`,

  sendVerificationCode: `${BasePath}api/user/sendVerificationCode`,
  deleteLead: `${BasePath}api/leads/deleteLead`,
  getProfileData: `${BasePath}api/user/myProfile`,
  getUserByAgentVapiId: `${BasePath}api/agent/getUserByAgentVapiId`,
  getCardsList: `${BasePath}api/user/getPaymentMethods`,
  makeDefaultCard: `${BasePath}api/user/setDefaultPaymentMethod`,
  getPaymentHistory: `${BasePath}api/user/getTransactionsHistory`,

  //cancel plan
  cancelPlan: `${BasePath}api/user/cancelPlan`,
  //redeem plan
  redeemPlan: `${BasePath}api/user/redeemAbortCancelReward`,

  getNotifications: `${BasePath}api/user/notifications`,

  updateAgentImg: `${BasePath}api/agent/updateAgentProfileImage`,
  myApiKeys: `${BasePath}api/user/apiKeys`,
  genrateApiKey: `${BasePath}api/user/generateApiKey`,

  getImportantCalls: `${BasePath}api/leads/importantCalls`,

  updateProfileApi: `${BasePath}api/user/updateProfile`,

  getTeam: `${BasePath}api/team/getTeamMembers`,
  inviteTeamMember: `${BasePath}api/team/inviteTeamMember`,
  deleteTeamMember: `${BasePath}api/team/deleteTeamMember`,
  updateProfileApi: `${BasePath}api/user/updateProfile`,
  AssignLeadToTeam: `${BasePath}api/team/assignLeadToTeam`,

  delNumber: `${BasePath}api/agent/deletePhoneNumber`,
  calcelPlanReason: `${BasePath}api/user/addCancelPlanReason`,
  sendFeedbback: `${BasePath}api/user/sendFeedback`,
  getAiNot: `${BasePath}api/agent/sendTestAiNotification`,

  getUsers: `${BasePath}api/admin/users`,
  getUpcomingPayments: `${BasePath}api/admin/upcoming-charges`,
  getRefundNeededPayments: `${BasePath}api/admin/payments-needing-refund`,
  markRefundProcessed: `${BasePath}api/admin/payment-refund-processed`,

  addAffiliate: `${BasePath}api/admin/addAffiliate`,
  getAffiliate: `${BasePath}api/admin/getAffiliates`,
  deleteAffiliate: `${BasePath}api/admin/deleteAffiliate`,
  adminStats: `${BasePath}api/admin/adminStats`,

  getUsersForAffiliate: `${BasePath}api/admin/usersForAffiliate`,

  //Knowledgebase
  AddKnowledgebase: `${BasePath}api/kb/addKnowledgebase`,
  GetKnowledgebase: `${BasePath}api/kb/getKnowledgebase`,
  deleteKnowledgebase: `${BasePath}api/kb/deleteKnowledgebase`,
  // DeleteKnowledgebase: `${BasePath}api/kb/deleteKnowledgebase`,

  AdminAnalytics: `${BasePath}api/admin/adminAnalytics`,
  adminCallLogs: `${BasePath}api/admin/callLogsAdmin`,
  addMinutes: `${BasePath}api/admin/addMinutesToUser`,
  adminUsersWithUniquePhoneNumbers: `${BasePath}api/admin/adminUsersWithUniquePhoneNumbers`,

  adminEngagements: `${BasePath}api/admin/adminEngagements`,
  getProfileFromId: `${BasePath}api/user/getProfileFromId`,

  getUsersWithUniqueNumbers: `${BasePath}api/admin/adminUsersWithUniquePhoneNumbers`,
  getUsersWithAgents: `${BasePath}api/admin/adminUsersWithAgents`,
  getUsersWithPipelines: `${BasePath}api/admin/adminUsersWithPipelines`,
  getUsersWithLeads: `${BasePath}api/admin/adminUsersWithLeads`,
  getUsersWithTeams: `${BasePath}api/admin/adminUsersWithTeams`,
  getUsersWithCalenders: `${BasePath}api/admin/adminUsersWithCalendars`,
  deleteProfile: `${BasePath}api/user/deleteProfile`,
  deleteCalendar: `${BasePath}api/calendar/deleteCalendar`,
  getVerificationCodes: `${BasePath}api/admin/getVerificationCodes`,
  getAgentDetails: `${BasePath}api/agent/getAgentDetails`,
  setVoicemaeil: `${BasePath}api/agent/setVoicemail`,
  updateVoicemail: `${BasePath}api/agent/updateVoicemail`,

  enrichLead: `${BasePath}api/leads/enrichLead`,
  chechAffiliateUniqueUrl: `${BasePath}api/admin/checkAffiliateUrl`,
  getPayouts: `${BasePath}api/admin/getAffiliatePayouts`,
  addPayouts: `${BasePath}api/admin/payAffiliate`,

  //Stripe connect
  connectAgencyAccount: `${BasePath}api/agency/connectAgency`,

  getPlansForAgency: `${BasePath}api/agency/getPlanListForAgency`,
  pauseProfile: `${BasePath}api/user/pauseProfile`,

  //add and get agency plans
  addMonthlyPlan: `${BasePath}api/agency/createAgencyPlan`,
  getMonthlyPlan: `${BasePath}api/agency/getAgencyPlansList`,
  addXBarOptions: `${BasePath}api/agency/createAgencyXbarPlan`,
  getXBarOptions: `${BasePath}api/agency/getAgencyXbarPlansList`,
  CreateAgencySubAccount: `${BasePath}api/agency/createSubAccount`,
  getAgencySubAccount: `${BasePath}api/agency/getSubAccounts`,

  //subaccount plan apis
  getSubAccountPlans: `${BasePath}api/agency/getPlansForSubaccount`,
  subAgencyAndSubAccountPlans: `${BasePath}api/agency/subscribeAgencyPlan`,

  //add comment
  addComment: `${BasePath}api/leads/addCommentOnTranscript`,
  //create onboarding link
  createOnboardingLink: `${BasePath}api/agency/createConnectLink`,
  //setup twillio
  setUpAgencyTwilioKey: `${BasePath}api/agency/addSynthflowTwilio`,
  //upsell phone
  addUpSellPhone: `${BasePath}api/user/setPhoneNumberPrice`,

  getCallTranscript: `${BasePath}api/leads/getCallTranscript`,

  duplicateAgent: `${BasePath}api/agent/duplicateAgent`,
  resetTrail: `${BasePath}api/admin/resetTrial`,
  profileSupportDetails: `${BasePath}api/user/myProfileSupportDetails`,
  //twilio trust hub
  createBusinessProfile: `${BasePath}api/business-profile`,
  getBusinessProfile: `${BasePath}api/business-profile`,
  deleteCallLog: `${BasePath}api/leads/deleteCallLog`,
  confirmContinueCharging: `${BasePath}api/user/confirm-continue-charging`,
  addTwilio: `${BasePath}api/business-profile/twilio/create`,
  createCname: `${BasePath}api/business-profile/cnam`,
  createShakenStir: `${BasePath}api/business-profile/shakenstir`,
  createVoiceIntegrity: `${BasePath}api/business-profile/voice-integrity`,
  createBrandedCalling: `${BasePath}api/business-profile/branded-calling`,
  disconnectTwilio: `${BasePath}api/business-profile/twilio/disconnect`,
  addTrustProduct: `${BasePath}api/business-profile/trust-products/select`,

  profileSupportDetails: `${BasePath}api/user/myProfileSupportDetails`,

  getMcpTools: `${BasePath}api/agent/getMcpTools`,
  addMcpTool: `${BasePath}api/agent/addMcpTool`,
  editMcpTool: `${BasePath}api/agent/updateMcpTool`,
  deleteMcpTool: `${BasePath}api/agent/deleteMcpTool`,
  selectMcpTool: `${BasePath}api/agent/selectMcpTool`,
  attachMcpTool: `${BasePath}api/agent/addMcpToolToAgent`,
  removeMcpTool: `${BasePath}api/agent/removeMcpToolFromAgent`,

  //recordings
  getCallRecordings: `${BasePath}api/leads/getCall`,
  handleMultipleCharge: `${BasePath}api/user/handle-multiple-charge-action`,
};

export default Apis;

//2344233435567779

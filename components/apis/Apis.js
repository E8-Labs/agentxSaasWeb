// const BasePath = process.env.NEXT_PUBLIC_REACT_APP_BASE_URL;

// //console.log;

let BasePath =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

const Apis = {
  BasePath: BasePath,
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
  getVoices: 'https://fine-tuner.ai/api/1.1/wf/v2_voice_agent_voices',
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
  searchLeadsForMessaging: `${BasePath}api/leads/searchLeadsForMessaging`,
  getSheets: `${BasePath}api/leads/getSheets`,
  getAgents: `${BasePath}api/agent/getAgents`,
  attachSmartList: `${BasePath}api/agent/attachSmartList`,
  assignLeadToPipeLine: `${BasePath}api/pipeline/assignLeadsToPipeline`,
  uniqueColumns: `${BasePath}api/leads/getUniqueColumns`,
  CheckEmail: `${BasePath}api/user/checkEmailExists`,
  CheckPhone: `${BasePath}api/user/checkPhoneNumber`,
  getCallLogs: `${BasePath}api/leads/callLogs`,
  getCallsInBatch: `${BasePath}api/pipeline/getCallsInABatch`,
  getAgentCallsByType: `${BasePath}api/pipeline/getAgentCallsByType`,
  getAgentCallsByTypeApi: '/api/pipeline/agentCallsByType',
  getLeadsInBatch: `${BasePath}api/pipeline/leadsInBatch`,

  getSheduledCallLogs: `${BasePath}api/pipeline/getScheduledCalls`,
  getAdminSheduledCallLogs: `${BasePath}api/admin/getScheduledCallsAdmin`,
  getAgentCallLogs: `${BasePath}api/agent/getAgentCallActivity`,
  pauseAgent: `${BasePath}api/pipeline/pauseAgentCadence`,
  resumeCalls: `${BasePath}api/pipeline/resumeAgentCadence`,
  getUniqueColumns: `${BasePath}api/leads/getUniqueColumns`,
  getTagsList: `/api/tags`,
  getUniqueTags: `${BasePath}api/leads/getTagsList`,
  addSmartList: `${BasePath}api/leads/addSmartList`,
  updateAgentSupportButton: `${BasePath}api/agent/updateAgentSupportButton`,
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
  updateLeadNote: `/api/leads`, // Will be used with noteId in path
  deleteLeadNote: `/api/leads`, // Will be used with noteId in path
  getDashboardData: `${BasePath}api/agent/dashboard`,
  delLeadTag: `${BasePath}api/leads/deleteLeadTag`,
  delLeadTagPermanently: `${BasePath}api/leads/deleteTagByName`,
  //apis to add card & subscribe plan
  createSetupIntent: `${BasePath}api/user/createSetupIntent`,
  getPaymentIntent: `${BasePath}api/user/getSetupIntent`,
  addCard: `${BasePath}api/user/addPaymentMethod`,
  subscribePlan: `${BasePath}api/user/subscribePlan`,
  purchaseSupportPlan: `${BasePath}api/user/purchaseSupportPlan`,

  getLeadDetails: `${BasePath}api/leads/leadDetail`,
  getStagesList: `${BasePath}api/pipeline/getPipeline`,
  updateLeadStageApi: `${BasePath}api/leads/updateLeadStage`,
  updateLead: `${BasePath}api/leads/updateLead`,
  getLeadSettings: `${BasePath}api/leads`,
  updateLeadSettings: `${BasePath}api/leads`,

  sendVerificationCode: `${BasePath}api/user/sendVerificationCode`,
  deleteLead: `${BasePath}api/leads/deleteLead`,
  getProfileData: `${BasePath}api/user/myProfile`,
  getUserByAgentVapiId: `${BasePath}api/agent/getUserByAgent`,
  getUserByAgentVapiIdWithLeadDetails: `${BasePath}api/agent/getUserByAgentWithLeadDetails`,
  getCardsList: `${BasePath}api/user/getPaymentMethods`,
  makeDefaultCard: `${BasePath}api/user/setDefaultPaymentMethod`,
  getPaymentHistory: `${BasePath}api/user/getTransactionsHistory`,

  //cancel plan
  cancelPlan: `${BasePath}api/user/cancelPlan`,
  // canellationComplete: `${BasePath}api/user/cancellation/complete`,
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
  unassignLeadFromTeam: `${BasePath}api/team/unassignLeadFromTeam`,

  // Tasks API
  getTasks: `${BasePath}api/tasks`,
  createTask: `${BasePath}api/tasks`,
  updateTask: `${BasePath}api/tasks`,
  deleteTask: `${BasePath}api/tasks`,
  getTaskStats: `${BasePath}api/tasks/stats`,

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
  //remove and update agency xbars plan
  removeAgencyXBar: `${BasePath}api/agency/deleteAgencyXbarPlan`,
  updateAgencyXBar: `${BasePath}api/agency/updateAgencyXbarPlan`,
  removeAgencyPlan: `${BasePath}api/agency/deleteAgencyPlan`,
  updateAgencyPlan: `${BasePath}api/agency/updateAgencyPlan`,

  //subaccount plan apis
  getSubAccountPlans: `${BasePath}api/agency/getPlansForSubaccount`,
  subAgencyAndSubAccountPlans: `${BasePath}api/agency/subscribeAgencyPlan`,
  updateSubAccountPlansFromAgency: `${BasePath}api/agency/updateSubaccountPlans`,

  //add comment
  addComment: `${BasePath}api/leads/addCommentOnTranscript`,
  // Post comment in messaging thread
  postComment: `${BasePath}api/user/messaging/comment`,
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

  getAdminAgencies: `${BasePath}api/admin/agencies`,
  getAdminTransactions: `${BasePath}api/admin/transactions`,
  releaseHeldFunds: `${BasePath}api/admin/transactions/release`,

  templets: `${BasePath}api/templates`,
  gmailAccount: `${BasePath}api/mail/accounts`,
  connectGmailAccount: `${BasePath}api/mail/connect-gmail`,
  agencyMailAccount: `${BasePath}api/mail/agency-account`,
  // Mailgun APIs
  createMailgunIntegration: `${BasePath}api/mailgun/integration`,
  createMailgunSubdomain: `${BasePath}api/mailgun/subdomain`,
  verifyMailgunDomain: `${BasePath}api/mailgun/verify-domain`,
  listMailgunIntegrations: `${BasePath}api/mailgun/integrations`,
  getAvailableDomains: `${BasePath}api/mailgun/available-domains`,
  getMailgunIntegration: `${BasePath}api/mailgun/integration`,
  updateMailgunIntegration: `${BasePath}api/mailgun/integration`,
  fetchFreshDnsRecords: `${BasePath}api/mailgun/integration`,
  deleteMailgunIntegration: `${BasePath}api/mailgun/integration`,
  requestMailgunEmail: `${BasePath}api/mail/request-mailgun-email`,
  assignMailgunEmail: `${BasePath}api/mail/assign-mailgun-email`,
  getMessageSettings: `${BasePath}api/mail/settings`,
  updateMessageSettings: `${BasePath}api/mail/settings`,
  a2pNumbers: `${BasePath}api/agent/getA2PVerifiedNumbers`,

  agencyActivityData: `${BasePath}api/admin/stats`,

  // New Dynamic Plans API Endpoints
  getPlans: `${BasePath}api/plans`,
  getPlanById: `${BasePath}api/plans`,
  createPlan: `${BasePath}api/plans`,
  updatePlan: `${BasePath}api/plans`,
  togglePlanStatus: `${BasePath}api/plans`,
  getAllPlansAdmin: `${BasePath}api/plans/admin/all`,

  initiateCancelation: `${BasePath}api/user/cancellation/initiate`,
  pauseSubscription: `${BasePath}api/user/cancellation/pause`,
  continueToGift: `${BasePath}api/user/cancellation/continue-to-gift`,
  claimGiftMins: `${BasePath}api/user/cancellation/claim-gift`,
  continueToDiscount: `${BasePath}api/user/cancellation/continue-to-discount`,
  purchaseDiscountedMins: `${BasePath}api/user/cancellation/purchase-discount`,
  completeCancelatiton: `${BasePath}api/user/cancellation/complete`,
  sendEmailToLead: `${BasePath}api/templates/send-email`,
  sendSMSToLead: `${BasePath}api/templates/send-sms`,

  validateReferralCode: `${BasePath}api/user/validateReferralCode`,

  // Call Analytics API
  getCallAnalytics: `${BasePath}api/admin/call-analytics`,

  // Revenue APIs
  revenueSummary: `${BasePath}api/admin/revenue/summary`,
  revenueGrowth: `${BasePath}api/admin/revenue/revenue-growth`,
  revenueLeaderboard: `${BasePath}api/admin/revenue/leaderboard`,
  revenuePayoutsSummary: `${BasePath}api/admin/revenue/payouts/summary`,
  revenueTransactions: `${BasePath}api/admin/revenue/transactions`,

  // Plan Subscriptions API
  getPlanSubscriptions: `${BasePath}api/admin/analytics/plan-subscriptions`,

  // Payment Charges API
  getPaymentCharges: `${BasePath}api/admin/payment-charges`,

  // Cron Jobs API
  getCronStatus: `${BasePath}api/admin/cron/status`,
  getCronSummary: `${BasePath}api/admin/cron/summary`,
  getStuckCronJobs: `${BasePath}api/admin/cron/stuck`,
  getCronJobStatus: `${BasePath}api/admin/cron/status`,
  getCronConfig: `${BasePath}api/admin/cron/config`,
  restartCronJob: `${BasePath}api/admin/cron/restart`,

  //subaccount section apis
  requestFeatureFromAgency: `${BasePath}api/user/requestFeature`,

  // Scoring APIs
  getScoringTemplates: `${BasePath}api/agent/scoring-templates`,
  getAgentScoring: `${BasePath}api/agent/scoring`,
  createAgentScoring: `${BasePath}api/agent/scoring`,
  deleteAgentScoring: `${BasePath}api/agent/scoring`,
  copyAgentScoring: `${BasePath}api/agent/scoring`,

  exportLeads: `${BasePath}api/leads/export-csv`,

  //agency integrations
  userSettings: `${BasePath}api/settings`,
  getUserSettings: `${BasePath}api/settings`,

  calculateCreditCost: `${BasePath}api/user/calculate-charge`,
  processPayment: `${BasePath}api/leads/process-enrichment-payment`,

  //stripe apis
  createStripeLoginLink: `${BasePath}/api/agency/createStripeLoginLink`,

  //transaction details
  getTransactionDetails: `${BasePath}api/user/getTransactionDetails`,

  //agency calculator
  agencyCalculator: `${BasePath}api/agency/calculator`,

  // Agency Notification Customization APIs
  getAllNotificationCustomizations: `${BasePath}api/agency/notification-customizations`,
  getNotificationCustomization: `${BasePath}api/agency/notification-customizations`,
  createNotificationCustomization: `${BasePath}api/agency/notification-customizations`,
  deleteNotificationCustomization: `${BasePath}api/agency/notification-customizations`,
  toggleNotificationCustomization: `${BasePath}api/agency/notification-customizations`,
  previewNotificationTemplate: `${BasePath}api/agency/notification-customizations`,
  addSmartList: `${BasePath}api/leads/addSmartList`,

  resumeSubscription: `${BasePath}api/user/cancellation/resume`,
  editScoringTemplate: `${BasePath}api/agent/scoring-templates/update`,

  getHowToVideo: `${BasePath}api/user/getHowToVideos`,
  toggleHowToVideo: `${BasePath}api/user/toggleHowToVideoStatus`,
  updateHowToVideo: `${BasePath}api/user/updateHowToVideo`,
  uploadHowToVideo: `${BasePath}api/user/uploadHowToVideo`,

  // Promo Code APIs
  getPromoCodes: `${BasePath}api/admin/promo-codes`,
  getPromoCodeById: `${BasePath}api/admin/promo-codes`,
  createPromoCode: `${BasePath}api/admin/promo-codes`,
  updatePromoCode: `${BasePath}api/admin/promo-codes`,
  deletePromoCode: `${BasePath}api/admin/promo-codes`,
  getPromoCodeUsage: `${BasePath}api/admin/promo-codes`,

  // Agency Branding/White Labeling APIs
  getAgencyBranding: `${BasePath}api/agency/branding`,
  updateAgencyBrandingCompany: `${BasePath}api/agency/branding/company`,
  updateAgencyBrandingColors: `${BasePath}api/agency/branding/colors`,
  uploadBrandingLogo: `${BasePath}api/agency/branding/logo`,
  uploadBrandingFavicon: `${BasePath}api/agency/branding/favicon`,
  uploadSupportWidgetLogo: `${BasePath}api/agency/branding/support-widget-logo`,
  updateSupportWidgetTitle: `${BasePath}api/agency/branding/support-widget-title`,
  addCustomDomain: `${BasePath}api/agency/branding/domain`,
  verifyCustomDomain: `${BasePath}api/agency/branding/domain/verify`,
  getDomainStatus: `${BasePath}api/agency/branding/domain`,
  removeCustomDomain: `${BasePath}api/agency/branding/domain`,
  getBrandingAuditLogs: `${BasePath}api/agency/branding/audit`,
  lookupAgencyByDomain: `${BasePath}api/agency/lookup-by-domain`,
  updateAgencyTermsPrivacy: `${BasePath}api/agency/branding/terms-privacy`,
  getAgencyTermsByUUID: `${BasePath}api/agency/getTermsByUUID`,
  getAgencyPrivacyByUUID: `${BasePath}api/agency/getPrivacyByUUID`,
  getAgencyCancellationByUUID: `${BasePath}api/agency/getCancellationByUUID`,

  // Agency Global Phone Number APIs
  getAgencyPhoneNumbers: `${BasePath}api/agency/phone-numbers`,
  setAgencyGlobalNumber: `${BasePath}api/agency/set-global-number`,
  unsetAgencyGlobalNumber: `${BasePath}api/agency/unset-global-number`,

  // Messaging APIs
  getMessageThreads: `${BasePath}api/user/messaging/threads`,
  getThreadById: `${BasePath}api/user/messaging/threads`,
  getMessagesForThread: `${BasePath}api/user/messaging/threads`,
  markThreadAsRead: `${BasePath}api/user/messaging/threads`,
  deleteThread: `${BasePath}api/user/messaging/threads`,
  getEmailsBySubject: `${BasePath}api/user/messaging/emails-by-subject`,

  // AI Chat APIs
  aiChat: '/api/ai/chat',

  // Auto-Reply Draft APIs
  getDraftsForThread: `${BasePath}api/mail/drafts`,
  getDraftById: `${BasePath}api/mail/drafts`,
  sendDraft: `${BasePath}api/mail/drafts`,
  markDraftAsSent: `${BasePath}api/mail/drafts`,
  discardDraft: `${BasePath}api/mail/drafts`,
  generateCallSummaryFollowUpDrafts: `${BasePath}api/mail/drafts/call-summary-follow-up`,
  deleteProfileForAgencyRegistration: `${BasePath}api/user/deleteProfileForAgencyRegistration
`,
}

export default Apis

//2344233435567779

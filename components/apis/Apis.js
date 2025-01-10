const BasePath =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT !== "Production"
    ? "https://www.blindcircle.com/agentx/"
    : "https://www.blindcircle.com/agentxtest/";

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
  updatePipeline: `${BasePath}api/pipeline/updatePipeline`,
  createPipeLineCadence: `${BasePath}api/pipeline/createPipelineCadence`,
  getAgentCadence: `${BasePath}api/pipeline/getAgentCadence`,
  deletePipeline: `${BasePath}api/pipeline/deletePipeline`,
  updateAgent: `${BasePath}api/agent/updateAgent`,
  createLead: `${BasePath}api/leads/addLeads`,
  getLeads: `${BasePath}api/leads/getLeads`,
  getSheets: `${BasePath}api/leads/getSheets`,
  getAgents: `${BasePath}api/agent/getAgents`,
  assignLeadToPipeLine: `${BasePath}api/pipeline/assignLeadsToPipeline`,
  uniqueColumns: `${BasePath}api/leads/getUniqueColumns`,
  CheckEmail: `${BasePath}api/user/checkEmailExists`,
  CheckPhone: `${BasePath}api/user/checkPhoneNumber`,
  getCallLogs: `${BasePath}api/leads/callLogs`,
  getSheduledCallLogs: `${BasePath}api/pipeline/getScheduledCalls`,
  getAgentCallLogs: `${BasePath}api/agent/getAgentCallActivity`,
  pauseAgent: `${BasePath}api/pipeline/pauseAgentCadence`,
  resumeCalls: `${BasePath}api/pipeline/resumeAgentCadence`,
  getUniqueColumns: `${BasePath}api/leads/getUniqueColumns`,
  addSmartList: `${BasePath}api/leads/addSmartList`,
  delSmartList: `${BasePath}api/leads/deleteList`,
  addCustomStage: `${BasePath}api/pipeline/createStage`,
  deleteStage: `${BasePath}api/pipeline/deletePipelineStage`,
  UpdateStage: `${BasePath}api/pipeline/updateStage`,
  addObjectionGuardrial: `${BasePath}api/agent/addObjectionGuardRail`,
  getObjectionGuardrial: `${BasePath}api/agent/getObjectionsAndGuardrails`,
  DelObjectGuard: `${BasePath}api/agent/deleteObjectionGuardRail`,
  reorderStages: `${BasePath}api/pipeline/reorderStages`,
  createPipeLine: `${BasePath}api/pipeline/createPipeline`,
  testAI: `${BasePath}api/agent/testAi`,
  addCalender: `${BasePath}api/calendar/createCalendar`,
  addLeadNote: `${BasePath}api/leads/addLeadNote`,
  getDashboardData: `${BasePath}api/agent/dashboard`,
  delLeadTag: `${BasePath}api/leads/deleteLeadTag`,
  //apis to add card & subscribe plan
  addCard: `${BasePath}api/user/addPaymentMethod`,
  subscribePlan: `${BasePath}api/user/subscribePlan`,

  getLeadDetails: `${BasePath}api/leads/leadDetail`,
  getStagesList: `${BasePath}api/pipeline/getPipeline`,
  updateLeadStageApi: `${BasePath}api/leads/updateLeadStage`,

  sendVerificationCode: `${BasePath}api/user/sendVerificationCode`,
  deleteLead: `${BasePath}api/leads/deleteLead`,
  getProfileData: `${BasePath}api/user/myProfile`,
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
  updateProfileApi: `${BasePath}api/user/updateProfile`,
  AssignLeadToTeam: `${BasePath}api/team/assignLeadToTeam`
};

export default Apis;

//2344233435567779

const BasePath = "https://www.blindcircle.com/agentx/"

const Apis = {
    register: `${BasePath}api/user/register`,
    LogIn: `${BasePath}api/user/login`,
    defaultData: `${BasePath}api/data/loadDefaualtData`,
    buildAgent: `${BasePath}api/agent/buildAgent`,
    findPhoneNumber: `${BasePath}api/agent/findPhoneNumbers`,
    purchaseNumber: `${BasePath}api/agent/purchasePhone`,
    userAvailablePhoneNumber: `${BasePath}api/agent/listUsersAvailablePhoneNumbers`,
    asignPhoneNumber: `${BasePath}api/agent/assignPhoneNumber`,
    addKyc: `${BasePath}api/agent/addKyc`,
    getVoices: "https://fine-tuner.ai/api/1.1/wf/v2_voice_agent_voices",
    getKYCs: `${BasePath}api/agent/getKycs`,
    getPipelines: `${BasePath}api/pipeline/getPipelines`,
    createPipeLine: `${BasePath}api/pipeline/createPipelineCadence`,
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
    pauseAgent: `${BasePath}api/pipeline/pauseAgentCadence`,
    getUniqueColumns: `${BasePath}api/leads/getUniqueColumns`

}

export default Apis

const BasePath = "https://www.blindcircle.com/agentx/"

const Apis = {
    register: `${BasePath}api/user/register`,
    defaultData: `${BasePath}api/data/loadDefaualtData`,
    buildAgent: `${BasePath}api/agent/buildAgent`,
    findPhoneNumber: `${BasePath}api/agent/findPhoneNumbers`,
    purchaseNumber: `${BasePath}api/agent/purchasePhone`,
    addKyc: `${BasePath}api/agent/addKyc`,
    getVoices: "https://fine-tuner.ai/api/1.1/wf/v2_voice_agent_voices",
    getKYCs: `${BasePath}api/agent/getKycs`
}

export default Apis

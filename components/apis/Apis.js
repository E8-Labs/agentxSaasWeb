const BasePath = "https://www.blindcircle.com/agentx/"

const Apis = {
    register: `${BasePath}api/user/register`,
    defaultData: `${BasePath}api/data/loadDefaualtData`,
    buildAgent: `${BasePath}api/agent/buildAgent`,
    findPhoneNumber: `${BasePath}api/agent/findPhoneNumbers`,
    purchaseNumber: `${BasePath}api/agent/purchasePhone`,
    addSellerKyc: `${BasePath}api/agent/addKyc`
}

export default Apis

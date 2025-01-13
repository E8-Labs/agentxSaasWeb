export const PersistanceKeys = {
  LocalStorageCampaignee: "CampaigneeSaved",
  LocalStoragePipelines: "LocalStoragePipelines",
  RegisterDetails: "registerDetails",
};


//function for moving the other agents unique to paths
export const moveTo = (agentType) => {
  const handlers = {
    RealEstateAgent: handleContinue,
    SalesDevAgent: handleSalesAgentContinue,
    SolarRep: handleSolarAgentContinue,
    InsuranceAgent: handleInsuranceContinue,
    Marketer: handleMarketerAgentContinue,
    WebsiteAgent: handleWebsiteAgentContinue,
    RecruiterAgent: handleRecruiterAgentContinue,
    TaxAgent: handleTaxAgentContinue,
  };

  const handler = handlers[agentType];

  if (handler) {
    return handler(); // Call the appropriate handler function
  }

  console.warn(`No handler found for agentType: ${agentType}`);
};


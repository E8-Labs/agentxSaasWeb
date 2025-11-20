import Apis from "@/components/apis/Apis";
import axios from "axios";




export const fetchTemplates = async ({
    agentId,
    setTemplates,
    setTemplatesLoading,
    userId,
}) => {
  if (!agentId) return;

  setTemplatesLoading(true);
  try {
    let AuthToken = null;
    const localData = localStorage.getItem("User");
    if (localData) {
      const UserDetails = JSON.parse(localData);
      AuthToken = UserDetails.token;
    }

    console.log('Fetching templates for agentId:', agentId);
    console.log('Auth token:', AuthToken);

    let path =   Apis.getScoringTemplates

    if(userId){
      path = path + "?userId=" + userId;
    }
    console.log('API URL:', Apis.getScoringTemplates);

    const response = await axios.get(
    
      {
        headers: {
          'Authorization': `Bearer ${AuthToken}`,
        },
      }
    );

    console.log('Templates response:', response.data);

    let templates = [];
    if (response.data && response.data.data.templates && Array.isArray(response.data.data.templates)) {
      templates = response.data.data.templates;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      // Handle case where templates might be directly in response.data
      templates = response.data.data || [];
    } else {
      console.warn('Templates response is not an array:', response.data.data);
      templates = [];
    }

    setTemplates(templates);

    // Note: Template selection is now determined by the agent's nested template object
    // No need to find templates by agentId anymore

  } catch (error) {
    console.error("Error fetching templates:", error);
    setTemplates([]); // Ensure templates is always an array
  } finally {
    setTemplatesLoading(false);
  }
};
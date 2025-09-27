import Apis from "@/components/apis/Apis";
import axios from "axios";




export const fetchTemplates = async ({
    agentId,
    setTemplates,
    setTemplatesLoading,
 
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
    console.log('API URL:', Apis.getScoringTemplates);

    const response = await axios.get(
      Apis.getScoringTemplates,
      {
        headers: {
          'Authorization': `Bearer ${AuthToken}`,
        },
      }
    );

    console.log('Templates response:', response.data);

    if (response.data && response.data.templates && Array.isArray(response.data.templates)) {
      setTemplates(response.data.templates);
    } else if (response.data && Array.isArray(response.data)) {
      // Handle case where templates might be directly in response.data
      setTemplates(response.data || []);
    } else {
      console.warn('Templates response is not an array:', response.data);
      setTemplates([]);
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
    setTemplates([]); // Ensure templates is always an array
  } finally {
    setTemplatesLoading(false);
  }
};
import { AuthToken } from "@/components/agency/plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import axios from "axios";

interface NotificationCustomizationData {
  customPushTitle?: string;
  customPushBody?: string;
  customEmailSubject?: string;
  customEmailBody?: string;
  customEmailCTA?: string;
  isActive?: boolean;
  isNotificationEnabled?: boolean;
}

/**
 * Get all notification types with metadata and customization status
 */
export const getAllNotificationCustomizations = async (userId?: number) => {
  try {
    let apiUrl = Apis.getAllNotificationCustomizations
    if (userId) {
      apiUrl += `?userId=${userId}`
    }
    
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: "Bearer " + AuthToken(),
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      console.log("getAllNotificationCustomizations response:", response.data);
      return response.data;
    } else {
      console.error("getAllNotificationCustomizations error:", response.data);
      throw new Error(response.data.message || "Failed to fetch notification types");
    }
  } catch (error: any) {
    console.error("getAllNotificationCustomizations error:", error);
    throw error;
  }
};

/**
 * Get a specific notification customization
 */
export const getNotificationCustomization = async (notificationType: string, userId?: number) => {
  try {
    let apiUrl = `${Apis.getNotificationCustomization}/${notificationType}`
    if (userId) {
      apiUrl += `?userId=${userId}`
    }
    
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: "Bearer " + AuthToken(),
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      console.log("getNotificationCustomization response:", response.data);
      return response.data;
    } else {
      console.error("getNotificationCustomization error:", response.data);
      throw new Error(response.data.message || "Failed to fetch notification customization");
    }
  } catch (error: any) {
    console.error("getNotificationCustomization error:", error);
    throw error;
  }
};

/**
 * Create or update notification customization
 */
export const createOrUpdateNotificationCustomization = async (
  notificationType: string,
  data: NotificationCustomizationData,
  userId?: number
) => {
  try {
    const requestData = { ...data }
    if (userId) {
      requestData.userId = userId
    }
    
    const response = await axios.post(
      `${Apis.createNotificationCustomization}/${notificationType}`,
      requestData,
      {
        headers: {
          Authorization: "Bearer " + AuthToken(),
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      console.log("createOrUpdateNotificationCustomization response:", response.data);
      return response.data;
    } else {
      console.error("createOrUpdateNotificationCustomization error:", response.data);
      throw new Error(response.data.message || "Failed to save notification customization");
    }
  } catch (error: any) {
    console.error("createOrUpdateNotificationCustomization error:", error);
    throw error;
  }
};

/**
 * Delete notification customization (revert to defaults)
 */
export const deleteNotificationCustomization = async (notificationType: string, userId?: number) => {
  try {
    let apiUrl = `${Apis.deleteNotificationCustomization}/${notificationType}`
    if (userId) {
      apiUrl += `?userId=${userId}`
    }
    
    const response = await axios.delete(apiUrl, {
      headers: {
        Authorization: "Bearer " + AuthToken(),
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      console.log("deleteNotificationCustomization response:", response.data);
      return response.data;
    } else {
      console.error("deleteNotificationCustomization error:", response.data);
      throw new Error(response.data.message || "Failed to delete notification customization");
    }
  } catch (error: any) {
    console.error("deleteNotificationCustomization error:", error);
    throw error;
  }
};

/**
 * Toggle notification customization active status
 */
export const toggleNotificationCustomization = async (notificationType: string, userId?: number) => {
  try {
    const requestData: any = {}
    if (userId) {
      requestData.userId = userId
    }
    
    const response = await axios.patch(
      `${Apis.toggleNotificationCustomization}/${notificationType}/toggle`,
      requestData,
      {
        headers: {
          Authorization: "Bearer " + AuthToken(),
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      console.log("toggleNotificationCustomization response:", response.data);
      return response.data;
    } else {
      console.error("toggleNotificationCustomization error:", response.data);
      throw new Error(response.data.message || "Failed to toggle notification customization");
    }
  } catch (error: any) {
    console.error("toggleNotificationCustomization error:", error);
    throw error;
  }
};

/**
 * Preview notification template with sample data
 */
export const previewNotificationTemplate = async (
  notificationType: string,
  data: NotificationCustomizationData,
  userId?: number
) => {
  try {
    const requestData = { ...data }
    if (userId) {
      requestData.userId = userId
    }
    
    const response = await axios.post(
      `${Apis.previewNotificationTemplate}/${notificationType}/preview`,
      requestData,
      {
        headers: {
          Authorization: "Bearer " + AuthToken(),
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      console.log("previewNotificationTemplate response:", response.data);
      return response.data;
    } else {
      console.error("previewNotificationTemplate error:", response.data);
      throw new Error(response.data.message || "Failed to preview notification template");
    }
  } catch (error: any) {
    console.error("previewNotificationTemplate error:", error);
    throw error;
  }
};

/**
 * Toggle notification enable/disable status
 */
export const toggleNotificationEnabled = async (notificationType: string, userId?: number) => {
  try {
    const requestData: any = {}
    if (userId) {
      requestData.userId = userId
    }
    
    const response = await axios.patch(
      `${Apis.toggleNotificationCustomization}/${notificationType}/toggle-enabled`,
      requestData,
      {
        headers: {
          Authorization: "Bearer " + AuthToken(),
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      console.log("toggleNotificationEnabled response:", response.data);
      return response.data;
    } else {
      console.error("toggleNotificationEnabled error:", response.data);
      throw new Error(response.data.message || "Failed to toggle notification enabled status");
    }
  } catch (error: any) {
    console.error("toggleNotificationEnabled error:", error);
    throw error;
  }
};

/**
 * Set notification enable/disable status explicitly
 */
export const setNotificationEnabled = async (
  notificationType: string,
  isNotificationEnabled: boolean,
  userId?: number
) => {
  try {
    const requestData: any = { isNotificationEnabled }
    if (userId) {
      requestData.userId = userId
    }
    
    const response = await axios.patch(
      `${Apis.toggleNotificationCustomization}/${notificationType}/set-enabled`,
      requestData,
      {
        headers: {
          Authorization: "Bearer " + AuthToken(),
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      console.log("setNotificationEnabled response:", response.data);
      return response.data;
    } else {
      console.error("setNotificationEnabled error:", response.data);
      throw new Error(response.data.message || "Failed to set notification enabled status");
    }
  } catch (error: any) {
    console.error("setNotificationEnabled error:", error);
    throw error;
  }
};

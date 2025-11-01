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
}

/**
 * Get all notification types with metadata and customization status
 */
export const getAllNotificationCustomizations = async () => {
  try {
    const response = await axios.get(Apis.getAllNotificationCustomizations, {
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
export const getNotificationCustomization = async (notificationType: string) => {
  try {
    const response = await axios.get(
      `${Apis.getNotificationCustomization}/${notificationType}`,
      {
        headers: {
          Authorization: "Bearer " + AuthToken(),
          "Content-Type": "application/json",
        },
      }
    );

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
  data: NotificationCustomizationData
) => {
  try {
    const response = await axios.post(
      `${Apis.createNotificationCustomization}/${notificationType}`,
      data,
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
export const deleteNotificationCustomization = async (notificationType: string) => {
  try {
    const response = await axios.delete(
      `${Apis.deleteNotificationCustomization}/${notificationType}`,
      {
        headers: {
          Authorization: "Bearer " + AuthToken(),
          "Content-Type": "application/json",
        },
      }
    );

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
export const toggleNotificationCustomization = async (notificationType: string) => {
  try {
    const response = await axios.patch(
      `${Apis.toggleNotificationCustomization}/${notificationType}/toggle`,
      {},
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
  data: NotificationCustomizationData
) => {
  try {
    const response = await axios.post(
      `${Apis.previewNotificationTemplate}/${notificationType}/preview`,
      data,
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

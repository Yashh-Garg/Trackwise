// Updated fetch-util.js for your frontend
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token ?? ""}`;
  }
  return config;
});

// Add a global handler for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch a custom event to trigger logout in AuthProvider
      window.dispatchEvent(new Event("force-logout"));
    }
    return Promise.reject(error);
  }
);

const postData = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await api.post(url, data);
  return response.data;
};

const updateData = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await api.put(url, data);
  return response.data;
};

const fetchData = async <T>(url: string): Promise<T> => {
  const response = await api.get(url);
  return response.data;
};

const deleteData = async <T>(url: string): Promise<T> => {
  const response = await api.delete(url);
  return response.data;
};

const patchData = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.patch(url, data);
  return response.data;
};

const fetchUtil = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('authToken'); // or however you store auth
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

const uploadFile = async <T>(url: string, formData: FormData): Promise<T> => {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Don't set Content-Type for FormData, let browser set it
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ========================================
// NOTIFICATION FUNCTIONS
// ========================================

// Get all notifications
export const getNotifications = async () => {
  return fetchData("/notification");
};

// Get unread notification count
export const getUnreadNotificationCount = async () => {
  return fetchData("/notification/unread-count");
};

// Mark specific notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  return patchData(`/notification/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  return patchData("/notification/read-all");
};

// Delete a specific notification
export const deleteNotification = async (notificationId: string) => {
  return deleteData(`/notification/${notificationId}`);
};

// ========================================
// WORKSPACE INVITE FUNCTIONS
// ========================================

// Create workspace invite
export const createWorkspaceInvite = async (workspaceId: string, inviteData: { email: string; role?: "member" | "admin" | "viewer" }) => {
  return postData(`/notification/workspace/${workspaceId}/invite`, inviteData);
};

// Get workspace invites
export const getWorkspaceInvites = async (workspaceId: string) => {
  return fetchData(`/notification/workspace/${workspaceId}/invites`);
};

// Accept workspace invite
export const acceptWorkspaceInvite = async (workspaceId: string, inviteId: string) => {
  return postData(`/notification/workspace/${workspaceId}/invites/${inviteId}/accept`, {});
};

// Reject workspace invite
export const rejectWorkspaceInvite = async (workspaceId: string, inviteId: string) => {
  return postData(`/notification/workspace/${workspaceId}/invites/${inviteId}/reject`, {});
};

// Cancel workspace invite
export const cancelWorkspaceInvite = async (workspaceId: string, inviteId: string) => {
  return deleteData(`/notification/workspace/${workspaceId}/invites/${inviteId}`);
};

export { postData, fetchData, updateData, deleteData, patchData, fetchUtil, uploadFile };

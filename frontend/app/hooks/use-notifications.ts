import { useState, useEffect } from "react";
import socket from "@/lib/socket";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  acceptWorkspaceInvite,
  rejectWorkspaceInvite
} from "@/lib/fetch-util";

export interface Notification {
  _id: string;
  type: 'workspace_invite' | 'task_assigned' | 'task_completed' | 'project_updated' | 'member_joined' | 'deadline_reminder' | 'comment_added';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  senderName?: string;
  senderAvatar?: string;
  workspaceName?: string;
  projectName?: string;
  taskName?: string;
  inviteId?: string;
  workspaceId?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notifications initially
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all as read");
    }
  };

  const deleteNotificationById = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      // adjust unread count if deleted one was unread
      const deleted = notifications.find(n => n._id === notificationId);
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification");
    }
  };

  const acceptInvite = async (inviteId: string, workspaceId: string) => {
    try {
      await acceptWorkspaceInvite(workspaceId, inviteId);
      setNotifications(prev => prev.filter(n => n.inviteId !== inviteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invite");
    }
  };

  const rejectInvite = async (inviteId: string, workspaceId: string) => {
    try {
      await rejectWorkspaceInvite(workspaceId, inviteId);
      setNotifications(prev => prev.filter(n => n.inviteId !== inviteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject invite");
    }
  };

  // Real-time listener
  useEffect(() => {
    fetchNotifications(); // initial load

    socket.on("new_notification", (newNotif: Notification) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  // Optional: polling fallback every 30s to refresh unread count
  useEffect(() => {
    const interval = setInterval(() => {
      setUnreadCount(notifications.filter(n => !n.isRead).length);
    }, 30000);
    return () => clearInterval(interval);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationById,
    acceptInvite,
    rejectInvite,
  };
}

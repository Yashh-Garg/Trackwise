import Notification from "../models/notification.js";
import User from "../models/user.js";
import Workspace from "../models/workspace.js";
import { getSocketIO } from "../socket/socket-server.js"; // We'll create this

class NotificationService {
  // Create a new notification with real-time emission
  static async createNotification({
    recipient,
    type,
    title,
    message,
    sender = null,
    workspace = null,
    project = null,
    task = null,
    inviteId = null,
    actionUrl = null,
    metadata = {}
  }) {
    try {
      const notification = new Notification({
        recipient,
        type,
        title,
        message,
        sender,
        workspace,
        project,
        task,
        inviteId,
        actionUrl,
        metadata
      });

      await notification.save();
      
      // Populate the notification for real-time emission
      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name email profilePicture')
        .populate('workspace', 'name')
        .populate('project', 'name')
        .populate('task', 'title')
        .lean();

      // Transform for frontend
      const transformedNotification = {
        _id: populatedNotification._id,
        type: populatedNotification.type,
        title: populatedNotification.title,
        message: populatedNotification.message,
        isRead: populatedNotification.isRead,
        createdAt: populatedNotification.createdAt,
        actionUrl: populatedNotification.actionUrl,
        senderName: populatedNotification.sender?.name,
        senderAvatar: populatedNotification.sender?.profilePicture,
        workspaceName: populatedNotification.workspace?.name,
        projectName: populatedNotification.project?.name,
        taskName: populatedNotification.task?.title,
        inviteId: populatedNotification.inviteId,
        workspaceId: populatedNotification.workspace?._id
      };

      // Emit real-time notification
      const io = getSocketIO();
      if (io) {
        io.to(`user_${recipient.toString()}`).emit('new_notification', {
          notification: transformedNotification,
          unreadCount: await this.getUnreadCount(recipient)
        });
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get unread count helper
  static async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        recipient: userId,
        isRead: false
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const query = { recipient: userId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .populate('sender', 'name email profilePicture')
        .populate('workspace', 'name')
        .populate('project', 'name')
        .populate('task', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false
      });

      // Transform notifications to match frontend interface
      const transformedNotifications = notifications.map(notification => ({
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        actionUrl: notification.actionUrl,
        senderName: notification.sender?.name,
        senderAvatar: notification.sender?.profilePicture,
        workspaceName: notification.workspace?.name,
        projectName: notification.project?.name,
        taskName: notification.task?.title,
        inviteId: notification.inviteId,
        workspaceId: notification.workspace?._id
      }));

      return {
        notifications: transformedNotifications,
        unreadCount,
        totalCount: await Notification.countDocuments(query)
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read with real-time update
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Emit updated unread count
      const io = getSocketIO();
      if (io) {
        const newUnreadCount = await this.getUnreadCount(userId);
        io.to(`user_${userId.toString()}`).emit('unread_count_updated', {
          unreadCount: newUnreadCount
        });
      }

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read with real-time update
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );

      // Emit updated unread count
      const io = getSocketIO();
      if (io) {
        io.to(`user_${userId.toString()}`).emit('unread_count_updated', {
          unreadCount: 0
        });
      }

      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Emit updated unread count if deleted notification was unread
      if (!notification.isRead) {
        const io = getSocketIO();
        if (io) {
          const newUnreadCount = await this.getUnreadCount(userId);
          io.to(`user_${userId.toString()}`).emit('unread_count_updated', {
            unreadCount: newUnreadCount
          });
        }
      }

      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Notification creators for different types
  static async createWorkspaceInviteNotification(inviteId, recipientId, senderId, senderName, workspaceName) {
    return this.createNotification({
      recipient: recipientId,
      type: 'workspace_invite',
      title: 'Workspace Invitation',
      message: `${senderName} invited you to join "${workspaceName}" workspace`,
      sender: senderId,
      inviteId: inviteId,
      actionUrl: `/workspaces/invites/${inviteId}`
    });
  }

  static async createTaskAssignedNotification(taskId, recipientId, senderId, senderName, taskName, projectName) {
    return this.createNotification({
      recipient: recipientId,
      type: 'task_assigned',
      title: 'Task Assigned',
      message: `${senderName} assigned you to task "${taskName}" in ${projectName}`,
      sender: senderId,
      task: taskId,
      actionUrl: `/tasks/${taskId}`
    });
  }

  static async createTaskCompletedNotification(taskId, recipientId, senderId, senderName, taskName, projectName) {
    return this.createNotification({
      recipient: recipientId,
      type: 'task_completed',
      title: 'Task Completed',
      message: `${senderName} completed task "${taskName}" in ${projectName}`,
      sender: senderId,
      task: taskId,
      actionUrl: `/tasks/${taskId}`
    });
  }

  static async createProjectUpdatedNotification(projectId, recipientId, senderId, senderName, projectName, updateType) {
    return this.createNotification({
      recipient: recipientId,
      type: 'project_updated',
      title: 'Project Updated',
      message: `${senderName} ${updateType} project "${projectName}"`,
      sender: senderId,
      project: projectId,
      actionUrl: `/projects/${projectId}`
    });
  }

  static async createMemberJoinedNotification(workspaceId, recipientId, memberName, workspaceName) {
    return this.createNotification({
      recipient: recipientId,
      type: 'member_joined',
      title: 'New Member Joined',
      message: `${memberName} joined "${workspaceName}" workspace`,
      workspace: workspaceId,
      actionUrl: `/workspaces/${workspaceId}/members`
    });
  }

  static async createDeadlineReminderNotification(taskId, recipientId, taskName, deadline) {
    return this.createNotification({
      recipient: recipientId,
      type: 'deadline_reminder',
      title: 'Deadline Reminder',
      message: `Task "${taskName}" is due on ${new Date(deadline).toLocaleDateString()}`,
      task: taskId,
      actionUrl: `/tasks/${taskId}`
    });
  }

  static async createCommentAddedNotification(taskId, recipientId, senderId, senderName, taskName) {
    return this.createNotification({
      recipient: recipientId,
      type: 'comment_added',
      title: 'New Comment',
      message: `${senderName} added a comment to task "${taskName}"`,
      sender: senderId,
      task: taskId,
      actionUrl: `/tasks/${taskId}`
    });
  }

  // Bulk notification creation for workspace members
  static async createBulkNotifications(notifications) {
    try {
      const createdNotifications = await Notification.insertMany(notifications);
      
      // Group notifications by recipient for efficient socket emission
      const notificationsByRecipient = {};
      for (const notification of createdNotifications) {
        const recipientId = notification.recipient.toString();
        if (!notificationsByRecipient[recipientId]) {
          notificationsByRecipient[recipientId] = [];
        }
        notificationsByRecipient[recipientId].push(notification);
      }

      // Emit notifications to each recipient
      const io = getSocketIO();
      if (io) {
        for (const [recipientId, userNotifications] of Object.entries(notificationsByRecipient)) {
          const unreadCount = await this.getUnreadCount(recipientId);
          
          // Populate and transform notifications
          const populatedNotifications = await Notification.find({
            _id: { $in: userNotifications.map(n => n._id) }
          })
          .populate('sender', 'name email profilePicture')
          .populate('workspace', 'name')
          .populate('project', 'name')
          .populate('task', 'title')
          .lean();

          const transformedNotifications = populatedNotifications.map(notification => ({
            _id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            actionUrl: notification.actionUrl,
            senderName: notification.sender?.name,
            senderAvatar: notification.sender?.profilePicture,
            workspaceName: notification.workspace?.name,
            projectName: notification.project?.name,
            taskName: notification.task?.title,
            inviteId: notification.inviteId,
            workspaceId: notification.workspace?._id
          }));

          // Emit each notification
          transformedNotifications.forEach(notification => {
            io.to(`user_${recipientId}`).emit('new_notification', {
              notification,
              unreadCount
            });
          });
        }
      }

      return createdNotifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Clean up old notifications
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
      });

      return result;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

export default NotificationService;
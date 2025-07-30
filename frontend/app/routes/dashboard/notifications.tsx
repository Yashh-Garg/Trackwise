import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNotifications } from '@/hooks/use-notifications';
import {
  Bell,
  UserPlus,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Trash2,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'workspace_invite':
      return <UserPlus className="w-5 h-5 text-blue-500" />;
    case 'task_assigned':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'task_completed':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'project_updated':
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    case 'member_joined':
      return <UserPlus className="w-5 h-5 text-purple-500" />;
    case 'deadline_reminder':
      return <Clock className="w-5 h-5 text-red-500" />;
    case 'comment_added':
      return <MessageSquare className="w-5 h-5 text-indigo-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'workspace_invite':
      return 'bg-blue-50 border-blue-200';
    case 'task_assigned':
    case 'task_completed':
      return 'bg-green-50 border-green-200';
    case 'project_updated':
      return 'bg-orange-50 border-orange-200';
    case 'member_joined':
      return 'bg-purple-50 border-purple-200';
    case 'deadline_reminder':
      return 'bg-red-50 border-red-200';
    case 'comment_added':
      return 'bg-indigo-50 border-indigo-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    acceptInvite,
    rejectInvite,
  } = useNotifications();

  const handleMarkAsRead = async (id: string) => {
    try { await markAsRead(id); } 
    catch (err) { console.error("Error marking as read:", err); }
  };

  const handleMarkAllAsRead = async () => {
    try { await markAllAsRead(); } 
    catch (err) { console.error("Error marking all as read:", err); }
  };

  const handleDeleteNotification = async (id: string) => {
    try { await deleteNotification(id); }
    catch (err) { console.error("Error deleting notification:", err); }
  };

  const handleAcceptInvite = async (inviteId: string, workspaceId: string) => {
    try { await acceptInvite(inviteId, workspaceId); } 
    catch (err) { console.error("Error accepting invite:", err); }
  };

  const handleRejectInvite = async (inviteId: string, workspaceId: string) => {
    try { await rejectInvite(inviteId, workspaceId); } 
    catch (err) { console.error("Error rejecting invite:", err); }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Bell className="w-16 h-16 text-muted-foreground mb-4 mx-auto animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Loading notifications...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Upcoming Feature</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead} className="flex items-center gap-2">
            <Check className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground text-center">
                You're all caught up! Notifications will appear here when there's activity in your workspaces.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map(notification => (
            <Card
              key={notification._id}
              className={`${getNotificationColor(notification.type)} ${
                !notification.isRead ? 'ring-2 ring-primary/20' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {notification.senderName && (
                            <div className="flex items-center gap-1">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={notification.senderAvatar} />
                                <AvatarFallback className="text-xs">
                                  {notification.senderName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{notification.senderName}</span>
                            </div>
                          )}
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification._id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteNotification(notification._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {notification.type === 'workspace_invite' && notification.inviteId && notification.workspaceId && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => handleAcceptInvite(notification.inviteId!, notification.workspaceId!)}>
                          Accept
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRejectInvite(notification.inviteId!, notification.workspaceId!)}>
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

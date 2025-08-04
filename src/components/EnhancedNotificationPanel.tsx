import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle, Clock, X, Bell, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_booking_id?: string;
}

interface EnhancedNotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notificationCount: number;
  onNotificationCountChange: (count: number) => void;
}

const EnhancedNotificationPanel = ({ 
  isOpen, 
  onClose, 
  notificationCount, 
  onNotificationCountChange 
}: EnhancedNotificationPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      
      // Update notification count (unread notifications)
      const unreadCount = data?.filter(n => !n.is_read).length || 0;
      onNotificationCountChange(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      // Update notification count
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      const unreadCount = updatedNotifications.filter(n => !n.is_read).length;
      onNotificationCountChange(unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onNotificationCountChange(0);

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'booking':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user || !isOpen) return;

    fetchNotifications();

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {notificationCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notificationCount}
                </Badge>
              )}
            </SheetTitle>
            {notifications.some(n => !n.is_read) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground">
                You'll see booking updates and important messages here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-200 ${
                  !notification.is_read 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        !notification.is_read ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <Badge 
                            variant={getNotificationVariant(notification.type)} 
                            className="text-xs"
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(notification.created_at)}
                        </div>
                      </div>
                    </div>

                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs h-auto p-1"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EnhancedNotificationPanel;
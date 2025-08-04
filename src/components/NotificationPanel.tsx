import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, X, Check, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  booking_id: string;
  status: string;
  client_name: string;
  provider_name: string;
  service_name: string;
  booking_date: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notificationCount: number;
  onNotificationCountChange: (count: number) => void;
}

export default function NotificationPanel({ 
  isOpen, 
  onClose, 
  notificationCount,
  onNotificationCountChange 
}: NotificationPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isOpen) return;
    
    fetchNotifications();
    setupRealtimeSubscription();
  }, [user, isOpen]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Get user's bookings and their status changes
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          client_name,
          booking_date,
          status,
          created_at,
          services (
            name
          ),
          providers (
            name
          )
        `)
        .or(`client_name.eq.${user.email},providers.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform to notifications format
      const transformedNotifications = data?.map(booking => ({
        id: booking.id,
        booking_id: booking.id,
        status: booking.status,
        client_name: booking.client_name,
        provider_name: booking.providers?.name || 'Unknown Provider',
        service_name: booking.services?.name || 'Unknown Service',
        booking_date: booking.booking_date,
        created_at: booking.created_at,
        is_read: false
      })) || [];

      setNotifications(transformedNotifications);
      
      // Count unread notifications (status changes)
      const unreadCount = transformedNotifications.filter(n => 
        n.status !== 'pending' && !n.is_read
      ).length;
      
      onNotificationCountChange(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('booking-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    
    // Update count
    const unreadCount = notifications.filter(n => 
      n.status !== 'pending' && !n.is_read && n.id !== notificationId
    ).length;
    onNotificationCountChange(unreadCount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-background w-full max-w-md h-full shadow-lg">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-100px)]">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                        !notification.is_read && notification.status !== 'pending' ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${getStatusBadgeVariant(notification.status) === 'default' ? 'text-green-600' : 
                          getStatusBadgeVariant(notification.status) === 'destructive' ? 'text-red-600' : 'text-gray-600'}`}>
                          {getStatusIcon(notification.status)}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(notification.status)} className="text-xs">
                              {notification.status}
                            </Badge>
                            {!notification.is_read && notification.status !== 'pending' && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-sm font-medium">
                            {notification.status === 'accepted' 
                              ? `Your booking for ${notification.service_name} has been accepted!`
                              : notification.status === 'rejected'
                              ? `Your booking for ${notification.service_name} has been rejected`
                              : `New booking request for ${notification.service_name}`
                            }
                          </p>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Provider: {notification.provider_name}</p>
                            <p>Date: {new Date(notification.booking_date).toLocaleDateString()}</p>
                            <p>
                              {new Date(notification.created_at).toLocaleDateString()} at{' '}
                              {new Date(notification.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
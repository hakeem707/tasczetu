import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Phone, User, ArrowLeft } from 'lucide-react';

interface Booking {
  id: string;
  client_name: string;
  client_phone: string;
  booking_date: string;
  status: string;
  created_at: string;
  services: {
    name: string;
  } | null;
}

interface ProviderDashboardProps {
  onBack: () => void;
}

export default function ProviderDashboard({ onBack }: ProviderDashboardProps) {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    fetchBookings();
    setupRealtimeSubscription();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      // First get the provider record for the current user
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (providerError) {
        console.error('Error fetching provider:', providerError);
        return;
      }

      if (!provider) {
        toast({
          title: "No provider profile found",
          description: "Please create a provider profile first.",
          variant: "destructive",
        });
        return;
      }

      // Then fetch bookings for this provider
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          client_name,
          client_phone,
          booking_date,
          status,
          created_at,
          services (
            name
          )
        `)
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Error loading bookings",
          description: "Failed to load your bookings. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingStatus(bookingId);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating booking status:', error);
        toast({
          title: "Error updating booking",
          description: "Failed to update booking status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Booking updated",
        description: `Booking ${newStatus} successfully.`,
      });

      // Update local state immediately for better UX
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setUpdatingStatus(null);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    onBack();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your service bookings</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBookings ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bookings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Mobile view */}
                <div className="block md:hidden space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {booking.client_name}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {booking.client_phone}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                          {booking.services && (
                            <p className="text-sm font-medium">{booking.services.name}</p>
                          )}
                        </div>

                        {booking.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'accepted')}
                              disabled={updatingStatus === booking.id}
                              className="flex-1"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateBookingStatus(booking.id, 'rejected')}
                              disabled={updatingStatus === booking.id}
                              className="flex-1"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.client_name}
                          </TableCell>
                          <TableCell>{booking.client_phone}</TableCell>
                          <TableCell>{booking.services?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {booking.status === 'pending' ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'accepted')}
                                  disabled={updatingStatus === booking.id}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                  disabled={updatingStatus === booking.id}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                {booking.status === 'accepted' ? 'Accepted' : 'Rejected'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, User, CreditCard, MessageCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ServiceProvider {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  availability: string;
  isVerified?: boolean;
}

interface BookingFlowProps {
  provider: ServiceProvider;
  onBack: () => void;
  onChat?: (chatData: { userId: string; userEmail: string; userName?: string; bookingId?: string }) => void;
}

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
];

const BookingFlow = ({ provider, onBack, onChat }: BookingFlowProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [providerUserId, setProviderUserId] = useState<string>("");
  const [providerEmail, setProviderEmail] = useState<string>("");
  const [bookingData, setBookingData] = useState({
    date: undefined as Date | undefined,
    time: "",
    address: "",
    description: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    paymentMethod: ""
  });

  // Fetch services for this provider and provider's user_id
  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        // First, get the provider's user_id
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('user_id')
          .eq('id', provider.id)
          .single();

        if (providerError) throw providerError;

        if (providerData) {
          setProviderUserId(providerData.user_id);
          // For now, we'll use a placeholder email since we can't access auth.users from client
          setProviderEmail(`${provider.name.toLowerCase().replace(' ', '.')}@taskzetu.local`);
        }

        // Then get the provider services
        const { data, error } = await supabase
          .from('provider_services')
          .select(`
            service_id,
            services (
              id,
              name,
              description
            )
          `)
          .eq('provider_id', provider.id);

        if (error) throw error;

        const services = data?.map(ps => ps.services).filter(Boolean) || [];
        setAvailableServices(services);
        if (services.length > 0) {
          setSelectedServiceId(services[0].id);
        }
      } catch (error) {
        console.error('Error fetching provider data:', error);
      }
    };

    fetchProviderData();
  }, [provider.id]);

  const handleNext = () => {
    if (step === 1) {
      if (!bookingData.date || !bookingData.time) {
        toast({
          title: "Error",
          description: "Please select date and time",
          variant: "destructive"
        });
        return;
      }
    } else if (step === 2) {
      if (!bookingData.address || !bookingData.description) {
        toast({
          title: "Error", 
          description: "Please fill in all service details",
          variant: "destructive"
        });
        return;
      }
    } else if (step === 3) {
      if (!bookingData.customerName || !bookingData.customerPhone) {
        toast({
          title: "Error",
          description: "Please fill in your contact information",
          variant: "destructive"
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBooking = async () => {
    if (!selectedServiceId) {
      toast({
        title: "Error",
        description: "Please select a service",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            client_name: bookingData.customerName,
            client_phone: bookingData.customerPhone,
            provider_id: provider.id,
            service_id: selectedServiceId,
            booking_date: bookingData.date?.toISOString().split('T')[0] || '',
            user_id: user?.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setBookingId(data.id);
      setBookingSuccess(true);

      toast({
        title: "Booking Confirmed!",
        description: "Your service booking has been confirmed. The provider will contact you soon.",
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !bookingData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.date ? format(bookingData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={bookingData.date}
                      onSelect={(date) => setBookingData(prev => ({ ...prev, date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Preferred Time</Label>
                <Select value={bookingData.time} onValueChange={(time) => setBookingData(prev => ({ ...prev, time }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="service">Select Service</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address">Service Address *</Label>
                <Textarea
                  id="address"
                  value={bookingData.address}
                  onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your full address..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="description">Additional Details (Optional)</Label>
                <Textarea
                  id="description"
                  value={bookingData.description}
                  onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any specific requirements or details..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={bookingData.customerName}
                  onChange={(e) => setBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={bookingData.customerPhone}
                  onChange={(e) => setBookingData(prev => ({ ...prev, customerPhone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email (Optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={bookingData.customerEmail}
                  onChange={(e) => setBookingData(prev => ({ ...prev, customerEmail: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment & Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={bookingData.paymentMethod} onValueChange={(method) => setBookingData(prev => ({ ...prev, paymentMethod: method }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-PESA</SelectItem>
                    <SelectItem value="cash">Cash on Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Booking Summary</h3>
                <p><strong>Service:</strong> {provider.category}</p>
                <p><strong>Provider:</strong> {provider.name}</p>
                <p><strong>Date:</strong> {bookingData.date ? format(bookingData.date, "PPP") : "Not selected"}</p>
                <p><strong>Time:</strong> {bookingData.time}</p>
                <p><strong>Note:</strong> Payment will be agreed directly with the provider</p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Book Service</h1>
              <p className="text-sm text-muted-foreground">
                Step {step} of 4 - {provider.name}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-2xl">
        {/* Provider Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={provider.image || '/placeholder.svg'} 
                  alt={provider.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-muted"
                />
                <div className="absolute -top-1 -right-1">
                  {provider.isVerified ? (
                    <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </span>
                  ) : (
                    <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs">
                      ?
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{provider.name}</h3>
                  {provider.isVerified && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✓ Verified by TaskZetu
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{provider.category}</p>
                <p className="text-sm">⭐ {provider.rating} ({provider.reviews} reviews)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content or Success State */}
        {bookingSuccess ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-6">
                Your service booking has been confirmed. The provider will contact you soon.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} className="flex-1">
                  Back to Home
                </Button>
                {onChat && providerUserId && (
                  <Button 
                    onClick={() => onChat({
                      userId: providerUserId,
                      userEmail: providerEmail || `${provider.name}@taskzetu.local`,
                      userName: provider.name,
                      bookingId: bookingId || undefined
                    })}
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Provider
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              
              {step < 4 ? (
                <Button onClick={handleNext} className="flex-1">
                  Next
                </Button>
              ) : (
                <Button onClick={handleBooking} className="flex-1">
                  Confirm Booking
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
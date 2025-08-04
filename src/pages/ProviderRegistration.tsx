import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, User, MapPin, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SkillsManager } from "@/components/SkillsManager";
import { WorkExperienceManager } from "@/components/WorkExperienceManager";

interface ProviderRegistrationProps {
  onBack: () => void;
}

const serviceCategories = [
  "Plumbing", "House Cleaning", "Car Wash", "Electrician", "Handyman Services",
  "AC & Fridge Repair", "Painting Services", "Pest Control", "Interior Design",
  "Furniture Assembly", "TV Mounting", "Gardening", "Home Moving", "Phone Repair",
  "CCTV Installation", "Wi-Fi Setup", "Graphic Design", "Photography", 
  "Private Tutors", "Makeup Artists", "Hair Stylists", "Fitness Trainers",
  "Massage Therapy", "DJ Services", "Tailoring", "Delivery Services"
];

const ProviderRegistration = ({ onBack }: ProviderRegistrationProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",
    location: "",
    selectedServices: [] as string[],
    pricing: "",
    availability: "",
    profilePhoto: null as File | null,
    idDocument: null as File | null
  });

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load services",
          variant: "destructive",
        });
      } else {
        setAvailableServices(data || []);
      }
    };

    fetchServices();
  }, [toast]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register as a provider",
        variant: "destructive",
      });
      onBack();
    }
  }, [user, onBack, toast]);

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(s => s !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleFileUpload = (field: 'profilePhoto' | 'idDocument', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${folder}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to register as a provider",
        variant: "destructive",
      });
      return;
    }

    if (formData.selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if user already has a provider profile
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProvider) {
        toast({
          title: "Error",
          description: "You already have a provider profile",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Upload files if present
      let profilePhotoUrl = null;
      let idDocumentUrl = null;

      if (formData.profilePhoto) {
        profilePhotoUrl = await uploadFile(formData.profilePhoto, 'provider-photos', 'profile');
      }

      if (formData.idDocument) {
        idDocumentUrl = await uploadFile(formData.idDocument, 'provider-documents', 'id');
      }

      // Insert provider data
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .insert([
          {
            user_id: user.id,
            name: formData.fullName,
            phone: formData.phone,
            bio: formData.bio,
            location: formData.location,
            service_category: availableServices.find(s => s.id === formData.selectedServices[0])?.name || "General",
            profile_photo_url: profilePhotoUrl,
            id_document_url: idDocumentUrl,
          }
        ])
        .select()
        .single();

      if (providerError) {
        throw providerError;
      }

      // Insert selected services
      const serviceInserts = formData.selectedServices.map(serviceId => ({
        provider_id: providerData.id,
        service_id: serviceId,
      }));

      const { error: servicesError } = await supabase
        .from('provider_services')
        .insert(serviceInserts);

      if (servicesError) {
        throw servicesError;
      }

      toast({
        title: "Success!",
        description: "Your provider registration has been submitted successfully.",
      });

      onBack();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit registration. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Become a Service Provider</h1>
              <p className="text-sm text-muted-foreground">
                Join our network and start earning
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>


              <div>
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell customers about your experience and skills..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={formData.selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label htmlFor={service.id} className="text-sm">
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location & Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Service Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Nairobi CBD, Mombasa, Kisumu, Eldoret"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricing" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Starting Price (KSh)
                  </Label>
                  <Input
                    id="pricing"
                    value={formData.pricing}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing: e.target.value }))}
                    placeholder="e.g., 2500"
                  />
                </div>
                <div>
                  <Label htmlFor="availability" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Availability
                  </Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                    placeholder="e.g., Mon-Fri 8AM-6PM"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Documents & Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profilePhoto">Profile Photo</Label>
                <Input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('profilePhoto', e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <Label htmlFor="idDocument">ID / Business License (Optional)</Label>
                <Input
                  id="idDocument"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload('idDocument', e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Upload your business license or ID to build customer trust
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Registering..." : "Register as Service Provider"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProviderRegistration;
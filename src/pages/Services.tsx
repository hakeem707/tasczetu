import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import ServiceCard from "@/components/ServiceCard";
import BookingFlow from "./BookingFlow";
import ProviderProfile from "./ProviderProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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

// Providers will be fetched from Supabase
const initialProviders: ServiceProvider[] = [];

interface ServicesProps {
  categoryId?: string;
  onBack: () => void;
  onChat?: (chatData: { userId: string; userEmail: string; userName?: string; bookingId?: string }) => void;
}

const Services = ({ categoryId, onBack, onChat }: ServicesProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Kenya");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>(initialProviders);
  const [loading, setLoading] = useState(true);

  // Fetch providers from Supabase
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        
        // Get providers with their services and ratings
        const { data: providersData, error: providersError } = await supabase
          .from('providers')
          .select(`
            id,
            name,
            location,
            bio,
            service_category,
            profile_photo_url,
            is_verified,
            provider_services (
              service_id,
              services (
                name
              )
            ),
            ratings (
              stars,
              work_quality,
              punctuality,
              communication,
              review_text
            )
          `);

        if (providersError) {
          console.error("Error fetching providers:", providersError);
          return;
        }

        // Transform data to match ServiceProvider interface
        const transformedProviders: ServiceProvider[] = providersData?.map((provider: any, index: number) => {
          const avgRating = provider.ratings.length > 0 
            ? provider.ratings.reduce((sum: number, r: any) => sum + r.stars, 0) / provider.ratings.length
            : 4.0 + (index % 10) / 10;

          return {
            id: provider.id,
            name: provider.name,
            image: provider.profile_photo_url || "/placeholder.svg",
            category: provider.service_category || provider.provider_services[0]?.services?.name || "General",
            rating: avgRating,
            reviews: provider.ratings.length,
            location: provider.location || "Kenya",
            availability: "Available",
            isVerified: provider.is_verified || false,
          };
        }) || [];

        setProviders(transformedProviders);
      } catch (error) {
        console.error("Error fetching providers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const handleBookNow = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      setShowBooking(true);
    }
  };

  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const handleViewProfile = (providerId: string) => {
    setSelectedProfileId(providerId);
    setShowProfile(true);
  };

  const handleChat = async (providerId: string, providerName: string) => {
    if (!onChat) return;
    
    try {
      // Get the provider's user_id from the providers table
      const { data: providerData, error } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', providerId)
        .single();

      if (error || !providerData) {
        console.error('Error fetching provider user data:', error);
        return;
      }

      onChat({
        userId: providerData.user_id,
        userEmail: `${providerName}@taskzetu.local`, // Fallback email
        userName: providerName
      });
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleFilterClick = () => {
    console.log("Opening filters");
    // TODO: Open filter modal
  };

  // Filter providers based on search query and selected category
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryId || provider.category.toLowerCase().includes(categoryId.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  if (showProfile && selectedProfileId) {
    return (
      <ProviderProfile
        providerId={selectedProfileId}
        onBack={() => {
          setShowProfile(false);
          setSelectedProfileId(null);
        }}
        onBookNow={() => {
          const provider = providers.find(p => p.id === selectedProfileId);
          if (provider) {
            setSelectedProvider(provider);
            setShowProfile(false);
            setShowBooking(true);
          }
        }}
      />
    );
  }

  if (showBooking && selectedProvider) {
    return (
      <BookingFlow 
        provider={selectedProvider}
        onBack={() => {
          setShowBooking(false);
          setSelectedProvider(null);
        }}
        onChat={onChat}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {categoryId ? `${categoryId} Services` : 'All Services'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredProviders.length} providers available
              </p>
            </div>
          </div>
          
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            location={location}
            onLocationChange={setLocation}
            onFilterClick={handleFilterClick}
            activeFilters={activeFilters}
          />
        </div>
      </div>

      {/* Services List */}
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading providers...</p>
            </div>
          ) : (
            <>
              {filteredProviders.map((provider) => (
                <ServiceCard
                  key={provider.id}
                  provider={provider}
                  onBookNow={handleBookNow}
                  onViewProfile={handleViewProfile}
                  onChat={handleChat}
                />
              ))}
              
              {filteredProviders.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">
                    No services found matching your criteria
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
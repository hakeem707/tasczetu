import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MapPin, Phone, Mail, Camera, MessageSquare } from "lucide-react";
import ReviewModal from "@/components/ReviewModal";
import PortfolioGallery from "@/components/PortfolioGallery";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SkillsManager } from "@/components/SkillsManager";
import { WorkExperienceManager } from "@/components/WorkExperienceManager";
import { ProviderProfileEditor } from "@/components/ProviderProfileEditor";
import { useAuth } from "@/contexts/AuthContext";

interface ProviderProfileProps {
  providerId: string;
  onBack: () => void;
  onBookNow: () => void;
}

interface Portfolio {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url?: string;
}

interface Rating {
  id: string;
  stars: number;
  work_quality?: number;
  punctuality?: number;
  communication?: number;
  review_text?: string;
  created_at: string;
}

const ProviderProfile = ({ providerId, onBack, onBookNow }: ProviderProfileProps) => {
  const [provider, setProvider] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if current user is the provider owner
  const isOwner = user && provider && provider.user_id === user.id;

  useEffect(() => {
    fetchProviderData();
  }, [providerId]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);

      // Fetch provider details
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select(`
          *,
          provider_services (
            service_id,
            services (
              name,
              description
            )
          )
        `)
        .eq('id', providerId)
        .single();

      if (providerError) throw providerError;

      // Fetch portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (portfolioError) throw portfolioError;

      // Fetch ratings and reviews
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (ratingsError) throw ratingsError;

      setProvider(providerData);
      setPortfolio(portfolioData || []);
      setRatings(ratingsData || []);
    } catch (error) {
      console.error('Error fetching provider data:', error);
      toast({
        title: "Error",
        description: "Failed to load provider profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length 
    : 0;

  const averageWorkQuality = ratings.filter(r => r.work_quality).length > 0
    ? ratings.filter(r => r.work_quality).reduce((sum, r) => sum + (r.work_quality || 0), 0) / ratings.filter(r => r.work_quality).length
    : 0;

  const averagePunctuality = ratings.filter(r => r.punctuality).length > 0
    ? ratings.filter(r => r.punctuality).reduce((sum, r) => sum + (r.punctuality || 0), 0) / ratings.filter(r => r.punctuality).length
    : 0;

  const averageCommunication = ratings.filter(r => r.communication).length > 0
    ? ratings.filter(r => r.communication).reduce((sum, r) => sum + (r.communication || 0), 0) / ratings.filter(r => r.communication).length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading provider profile...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Provider not found</p>
      </div>
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
              <h1 className="text-xl font-bold">Provider Profile</h1>
              <p className="text-sm text-muted-foreground">
                View details and portfolio
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        {/* Provider Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <img 
                  src={provider.profile_photo_url || '/placeholder.svg'} 
                  alt={provider.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-muted"
                />
                {provider.is_verified && (
                  <Badge variant="outline" className="mt-3 bg-green-50 text-green-700 border-green-200">
                    ✓ Verified by TaskZetu
                  </Badge>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{provider.name}</h2>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({ratings.length} reviews)</span>
                  </div>
                  {provider.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{provider.location}</span>
                    </div>
                  )}
                </div>

                <Badge variant="secondary" className="mb-4">
                  {provider.service_category}
                </Badge>

                {provider.bio && (
                  <p className="text-muted-foreground mb-4">{provider.bio}</p>
                )}

                <div className="flex gap-3 flex-wrap">
                  {!isOwner && (
                    <Button onClick={onBookNow} className="flex-1 md:flex-none">
                      Book Now
                    </Button>
                  )}
                  {!isOwner && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReviewModal(true)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  )}
                  {provider.phone && !isOwner && (
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  )}
                  {isOwner && (
                    <ProviderProfileEditor 
                      provider={provider} 
                      onProviderUpdate={setProvider}
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Offered */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {provider.provider_services?.map((ps: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{ps.services?.name}</h4>
                  {ps.services?.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {ps.services.description}
                    </p>
                  )}
                </div>
              )) || <p className="text-muted-foreground">No services listed</p>}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <SkillsManager providerId={provider.id} readonly />
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <WorkExperienceManager providerId={provider.id} readonly />
          </CardContent>
        </Card>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Work Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolio.map((item) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ratings Breakdown */}
        {ratings.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ratings & Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex justify-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${
                          star <= averageRating ? 'fill-warning text-warning' : 'text-muted-foreground'
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall</div>
                </div>
                
                {averageWorkQuality > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{averageWorkQuality.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Work Quality</div>
                  </div>
                )}
                
                {averagePunctuality > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{averagePunctuality.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Punctuality</div>
                  </div>
                )}
                
                {averageCommunication > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{averageCommunication.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Communication</div>
                  </div>
                )}
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {ratings.slice(0, 5).map((rating) => (
                  <div key={rating.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${
                              star <= rating.stars ? 'fill-warning text-warning' : 'text-muted-foreground'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.review_text && (
                      <p className="text-sm text-muted-foreground">{rating.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        providerId={provider.id}
        providerName={provider.name}
      />
    </div>
  );
};

export default ProviderProfile;
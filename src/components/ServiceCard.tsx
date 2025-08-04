import { Star, MapPin, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  is_verified?: boolean;
  profile_photo_url?: string;
}

interface ServiceCardProps {
  provider: ServiceProvider;
  onBookNow: (providerId: string) => void;
  onViewProfile: (providerId: string) => void;
  onChat: (providerId: string, providerName: string) => void;
}

const ServiceCard = ({ provider, onBookNow, onViewProfile, onChat }: ServiceCardProps) => {
  return (
    <Card className="group cursor-pointer bg-card border border-border hover:border-primary hover:shadow-card transition-all duration-300 hover:scale-105">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <img 
              src={provider.profile_photo_url || provider.image || '/placeholder.svg'} 
              alt={provider.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-muted"
            />
            {(provider.is_verified || provider.isVerified) && (
              <div className="absolute -top-1 -right-1">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    {provider.name}
                  </h3>
                  {(provider.is_verified || provider.isVerified) && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✓ Verified by TaskZetu
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs mb-1">
                  {provider.category}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-medium text-sm">{provider.rating}</span>
              <span className="text-xs text-muted-foreground">({provider.reviews} reviews)</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{provider.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{provider.availability}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onViewProfile(provider.id)}
              >
                View Profile
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onChat(provider.id, provider.name)}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={() => onBookNow(provider.id)}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
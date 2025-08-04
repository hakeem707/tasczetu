import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Image, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
}

interface PortfolioGalleryProps {
  providerId: string;
}

const PortfolioGallery = ({ providerId }: PortfolioGalleryProps) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('provider_id', providerId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPortfolioItems(data || []);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [providerId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (portfolioItems.length === 0) {
    return (
      <div className="text-center py-8">
        <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No portfolio items yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {portfolioItems.map((item) => (
          <Card 
            key={item.id} 
            className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
            onClick={() => setSelectedItem(item)}
          >
            <CardContent className="p-0 relative aspect-square">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : item.video_url ? (
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                  <Play className="w-12 h-12 text-white opacity-80" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <h4 className="text-white text-sm font-medium line-clamp-1">
                  {item.title}
                </h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Portfolio Item Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedItem?.title}</DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedItem(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.image_url && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={selectedItem.image_url} 
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {selectedItem.video_url && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    src={selectedItem.video_url} 
                    controls
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              
              {selectedItem.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PortfolioGallery;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
}

const ReviewModal = ({ isOpen, onClose, providerId, providerName }: ReviewModalProps) => {
  const [overall, setOverall] = useState(0);
  const [workQuality, setWorkQuality] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    label 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
    label: string; 
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= rating 
                ? 'fill-warning text-warning' 
                : 'text-muted-foreground hover:text-warning'
            }`}
            onClick={() => onRatingChange(star)}
          />
        ))}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to leave a review",
        variant: "destructive"
      });
      return;
    }

    if (overall === 0) {
      toast({
        title: "Error",
        description: "Please provide an overall rating",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('ratings')
        .insert([
          {
            provider_id: providerId,
            user_id: user.id,
            stars: overall,
            work_quality: workQuality || null,
            punctuality: punctuality || null,
            communication: communication || null,
            review_text: reviewText || null,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      onClose();
      
      // Reset form
      setOverall(0);
      setWorkQuality(0);
      setPunctuality(0);
      setCommunication(0);
      setReviewText("");
    } catch (error: any) {
      console.error('Review submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review {providerName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <StarRating 
            rating={overall} 
            onRatingChange={setOverall} 
            label="Overall Rating *" 
          />
          
          <StarRating 
            rating={workQuality} 
            onRatingChange={setWorkQuality} 
            label="Work Quality" 
          />
          
          <StarRating 
            rating={punctuality} 
            onRatingChange={setPunctuality} 
            label="Punctuality" 
          />
          
          <StarRating 
            rating={communication} 
            onRatingChange={setCommunication} 
            label="Communication" 
          />

          <div className="space-y-2">
            <Label htmlFor="review">Written Review (Optional)</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || overall === 0}
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
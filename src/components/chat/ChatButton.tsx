import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatButtonProps {
  onChatClick: () => void;
  providerId?: string;
  providerName?: string;
  bookingId?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function ChatButton({ 
  onChatClick, 
  providerId, 
  providerName, 
  bookingId,
  variant = "outline",
  size = "sm",
  className = ""
}: ChatButtonProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onChatClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      Chat
    </Button>
  );
}
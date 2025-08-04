import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { MessageCircle } from 'lucide-react';

export default function UnreadMessagesBadge() {
  const { totalUnreadCount } = useChat();

  if (totalUnreadCount === 0) {
    return <MessageCircle className="h-5 w-5" />;
  }

  return (
    <div className="relative">
      <MessageCircle className="h-5 w-5" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
      >
        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
      </Badge>
    </div>
  );
}
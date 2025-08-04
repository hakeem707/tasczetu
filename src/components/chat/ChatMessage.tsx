import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
  };
  isOwn: boolean;
  senderName?: string;
}

export default function ChatMessage({ message, isOwn, senderName }: ChatMessageProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {(senderName || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`px-4 py-2 rounded-2xl break-words ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
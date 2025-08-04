import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  conversation: {
    id: string;
    other_user_name?: string;
    last_message?: string;
    last_message_at: string;
    unread_count?: number;
  };
  isSelected: boolean;
  onClick: () => void;
}

export default function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer border-b transition-colors hover:bg-muted/50 ${
        isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback>
            {(conversation.other_user_name || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm truncate">
              {conversation.other_user_name || 'Unknown User'}
            </h3>
            <div className="flex items-center gap-2">
              {conversation.unread_count && conversation.unread_count > 0 && (
                <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {conversation.last_message || 'Start a conversation'}
          </p>
        </div>
      </div>
    </div>
  );
}
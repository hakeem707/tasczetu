import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  userName?: string;
}

export default function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {(userName || 'U').charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  onTyping?: () => void;
}

export default function MessageInput({ onSendMessage, disabled, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping?.();
  };

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="sm"
          className="px-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
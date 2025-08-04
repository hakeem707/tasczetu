import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import ChatMessage from './ChatMessage';
import ConversationItem from './ConversationItem';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';


interface ChatInterfaceProps {
  onBack: () => void;
  initialConversation?: {
    userId: string;
    userEmail: string;
    userName?: string;
    bookingId?: string;
  };
}

export default function ChatInterface({ onBack, initialConversation }: ChatInterfaceProps) {
  const { user } = useAuth();
  const {
    conversations,
    selectedConversation,
    messages,
    loading,
    sending,
    typingUsers,
    sendMessage,
    selectConversation,
    startConversationWithUser,
    broadcastTyping
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialConversation) {
      startConversationWithUser(initialConversation);
    }
  }, [initialConversation, startConversationWithUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">Chat with service providers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No conversations yet
                  </div>
                ) : (
                  <div className="space-y-0">
                    {conversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isSelected={selectedConversation?.id === conversation.id}
                        onClick={() => selectConversation(conversation)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat View */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {(selectedConversation.other_user_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversation.other_user_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[500px]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-1">
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isOwn={message.sender_id === user?.id}
                          senderName={selectedConversation?.other_user_name}
                        />
                      ))}
                      {typingUsers.map((typingUser) => (
                        <TypingIndicator
                          key={typingUser.userId}
                          userName={typingUser.userName}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <MessageInput
                    onSendMessage={sendMessage}
                    disabled={sending}
                    onTyping={broadcastTyping}
                  />
                </CardContent>
              </>
            ) : (
              <CardContent className="h-[500px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
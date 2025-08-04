import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  conversation_id: string;
  related_booking_id?: string;
}

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  last_message: string | null;
  related_booking_id?: string;
  other_user_name?: string;
  unread_count?: number;
}

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

export function useChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithUserData = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.participant_1_id === user.id 
            ? conv.participant_2_id 
            : conv.participant_1_id;

          // Get provider name
          const { data: providerData } = await supabase
            .from('providers')
            .select('name, user_id')
            .eq('user_id', otherUserId)
            .maybeSingle();

          let otherUserName = providerData?.name;

          // If not a provider, check booking for client name
          if (!otherUserName && conv.related_booking_id) {
            const { data: bookingData } = await supabase
              .from('bookings')
              .select('client_name, user_id, provider_id')
              .eq('id', conv.related_booking_id)
              .maybeSingle();

            if (bookingData) {
              if (bookingData.user_id === user.id) {
                // Current user is client, get provider name
                const { data: providerData } = await supabase
                  .from('providers')
                  .select('name')
                  .eq('id', bookingData.provider_id)
                  .maybeSingle();
                otherUserName = providerData?.name;
              } else {
                // Current user is provider, show client name
                otherUserName = bookingData.client_name;
              }
            }
          }

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('conversation_id', conv.id)
            .eq('is_read', false);

          return {
            ...conv,
            other_user_name: otherUserName || 'User',
            unread_count: unreadCount || 0
          };
        })
      );

      setConversations(conversationsWithUserData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchMessages = useCallback(async (conversation: Conversation) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user]);

  const markMessagesAsRead = useCallback(async (conversation: Conversation) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('conversation_id', conversation.id)
        .eq('is_read', false);

      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !selectedConversation || !content.trim()) return;

    setSending(true);
    const otherUserId = selectedConversation.participant_1_id === user.id 
      ? selectedConversation.participant_2_id 
      : selectedConversation.participant_1_id;

    try {
      let conversationId = selectedConversation.id;

      // If temp conversation, create it
      if (selectedConversation.id.startsWith('temp-')) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            participant_1_id: selectedConversation.participant_1_id,
            participant_2_id: selectedConversation.participant_2_id,
            related_booking_id: selectedConversation.related_booking_id,
            last_message: content.trim(),
            last_message_at: new Date().toISOString()
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
        setSelectedConversation(prev => prev ? { ...prev, id: conversationId } : null);
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: otherUserId,
          content: content.trim(),
          conversation_id: conversationId,
          related_booking_id: selectedConversation.related_booking_id
        })
        .select()
        .single();

      if (error) throw error;

      // Add message locally for instant feedback
      setMessages(prev => [...prev, data]);
      
      // Update conversation
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }, [user, selectedConversation, toast, fetchConversations]);

  const selectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation);
    await markMessagesAsRead(conversation);
  }, [fetchMessages, markMessagesAsRead]);

  const startConversationWithUser = useCallback(async (userInfo: {
    userId: string;
    userEmail: string;
    userName?: string;
    bookingId?: string;
  }) => {
    if (!user) return;

    // Check if conversation exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1_id.eq.${user.id < userInfo.userId ? user.id : userInfo.userId},participant_2_id.eq.${user.id < userInfo.userId ? userInfo.userId : user.id}),and(participant_1_id.eq.${user.id < userInfo.userId ? userInfo.userId : user.id},participant_2_id.eq.${user.id < userInfo.userId ? user.id : userInfo.userId})`)
      .eq('related_booking_id', userInfo.bookingId)
      .maybeSingle();

    if (existingConv) {
      const conversationWithUserData = {
        ...existingConv,
        other_user_name: userInfo.userName || userInfo.userEmail,
        unread_count: 0
      };
      selectConversation(conversationWithUserData);
      return;
    }

    // Create temp conversation
    const newConversation: Conversation = {
      id: 'temp-' + Date.now(),
      participant_1_id: user.id < userInfo.userId ? user.id : userInfo.userId,
      participant_2_id: user.id < userInfo.userId ? userInfo.userId : user.id,
      last_message_at: new Date().toISOString(),
      last_message: null,
      related_booking_id: userInfo.bookingId,
      other_user_name: userInfo.userName || userInfo.userEmail,
      unread_count: 0
    };

    setSelectedConversation(newConversation);
    setMessages([]);
  }, [user, selectConversation]);

  const broadcastTyping = useCallback(async () => {
    if (!user || !selectedConversation) return;

    const channel = supabase.channel(`typing-${selectedConversation.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { 
        userId: user.id, 
        userName: 'You',
        timestamp: Date.now() 
      }
    });
  }, [user, selectedConversation]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    console.log('Setting up chat realtime subscriptions for user:', user.id);

    // Messages subscription - listen to ALL message inserts, not just for current user
    const messagesChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          
          // Only process if this user is sender or receiver
          if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) {
            // Add to current conversation if active and it's the right conversation
            if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
              setMessages(prev => {
                // Check if message already exists to prevent duplicates
                const messageExists = prev.some(msg => msg.id === newMessage.id);
                if (messageExists) return prev;
                return [...prev, newMessage];
              });
              // Only mark as read if current user is the receiver
              if (newMessage.receiver_id === user.id) {
                markMessagesAsRead(selectedConversation);
              }
            }
            
            // Always update conversations list
            fetchConversations();
          }
        }
      )
      .subscribe((status) => {
        console.log('Messages channel status:', status);
      });

    // Conversations subscription for real-time updates
    const conversationsChannel = supabase
      .channel('public:conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('Conversations channel status:', status);
      });

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, selectedConversation, fetchConversations, markMessagesAsRead]);

  // Separate effect for typing indicators per conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const typingChannel = supabase
      .channel(`typing-${selectedConversation.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, userName, timestamp } = payload.payload;
        if (userId !== user?.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.userId !== userId);
            return [...filtered, { userId, userName, timestamp }];
          });
          
          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u.timestamp !== timestamp));
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [selectedConversation, user]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);

  return {
    conversations,
    selectedConversation,
    messages,
    loading,
    sending,
    typingUsers,
    totalUnreadCount,
    sendMessage,
    selectConversation,
    startConversationWithUser,
    broadcastTyping
  };
}
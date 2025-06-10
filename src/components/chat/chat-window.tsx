'use client';

import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { Message, User } from '@/lib/types';
import { pusher } from '@/lib/pusher';
import { useParams } from 'next/navigation';


interface ChatWindowProps {
  selectedUser: User | null;
  currentUser: User | null;
  conversationId: string | null;
}

export function ChatWindow({ selectedUser, currentUser, conversationId }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();

  console.log(conversationId)

  // Fetch messages for the selected user
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const response = await fetch(`/api/chat/messages?userId=${selectedUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setLocalMessages(data);
      return data;
    },
    enabled: !!selectedUser?.id,
    staleTime: Infinity,       // Data will never be considered stale
    // refetchOnWindowFocus: false, // Won't refetch when window regains focus   // Won't refetch when component remounts
    // refetchOnReconnect: false, // Won't refetch on network reconnect
    // retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageBody: string) => {
      if (!selectedUser?.id) return;

      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: messageBody,
          userId: selectedUser.id,
          image: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      return response.json();
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['messages', selectedUser?.id] });
    },
    onError: (error) => {
      // toast({
      //   title: 'Error',
      //   description: error.message,
      //   variant: 'destructive',
      // });
    },
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle auto-scroll
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  // Handle scroll events to determine if user is at bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
    setAutoScroll(isAtBottom);
  };

  const handleSendMessage = (messageBody: string) => {
    if (!selectedUser?.id) return;
    sendMessageMutation.mutate(messageBody);
  };

  const handleFileUpload = (file: File) => {
    console.log('File upload:', file.name);
  };

  useEffect(() => {
    console.log("useEffect")
    if (!conversationId || !currentUser?.id) return;


    const channelName = `private-chat-${conversationId}`;
    console.log(channelName);
    const channel = pusher.subscribe(channelName);

    // Handle new message event
    channel.bind('Message:new', (newMessage: Message) => {
      setLocalMessages((prevMessages: Message[]) => [...prevMessages, newMessage]);

      if (autoScroll) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    });

    queryClient.invalidateQueries({
      queryKey: ['messages', selectedUser?.id]
    });

    // Clean up subscription
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [conversationId]);



  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a user
          </h3>
          <p className="text-gray-500">
            Choose a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
              <AvatarFallback>
                {selectedUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {selectedUser.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
            <p className="text-sm text-gray-500">
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Video className="h-4 w-4" />
          </Button> */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        className="flex-1 p-4"
        onScrollCapture={handleScroll}
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            localMessages.map((message: Message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUser={currentUser}
                showAvatar={true}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        disabled={sendMessageMutation.isPending}
        placeholder={`Message ${selectedUser.name}...`}
      />
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageInput } from './message-input';
import { Message } from '@/lib/types';
import { pusher } from '@/lib/pusher';
import axios from 'axios';
import { MessageScroll } from './message-scroll';
import { ChatWindowProps } from '@/types/chat';
import { useSearchParams } from 'next/navigation';
import { useServerAction } from "zsa-react";
import { getMessages } from "@/app/chat/actions/get-messages";
import { toast } from "sonner"



export function ChatWindow({ selectedUser, currentUser }: ChatWindowProps) {

  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');

  const {
    execute,
    // data: newMessages = [],
    isPending: isLoading,
    error: messagesError
  } = useServerAction(getMessages, {
    onSuccess: (data) => {
      if (!data) return;
      setLocalMessages(data.data as Message[])
    },
    onError: () => {
      toast(messagesError?.message)
    }
  })

  useEffect(() => {
    if (conversationId) {
      execute({ conversationId: conversationId! })
    }
  }, [conversationId, execute])


  const sendMessageMutation = useMutation({
    mutationFn: async (messageBody: string) => {
      if (!selectedUser?.id) return;

      const response = await axios.post('/api/chat/messages', {
        body: messageBody,
        userId: selectedUser.id,
        image: null,
      });

      if (!response.data) {
        throw new Error('Failed to send message');
      }
      return response.data;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['messages', selectedUser?.id] });
    },
    onError: (error) => {
      toast(error.message)
    },
  });



  const handleSendMessage = (messageBody: string) => {
    if (!selectedUser?.id) return;
    sendMessageMutation.mutate(messageBody);
  };

  const handleFileUpload = (file: File) => {
    console.log('File upload:', file.name);
  };

  useEffect(() => {

    if (!conversationId || !currentUser?.id) return;


    const channelName = `private-chat-${conversationId}`;
    const channel = pusher.subscribe(channelName);

    // Handle new message event
    channel.bind('Message:new', (newMessage: Message) => {
      setLocalMessages((prevMessages: Message[]) => [...prevMessages, newMessage]);

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
      <MessageScroll
        localMessages={localMessages}
        isLoading={isLoading}
        currentUser={currentUser!}
      />
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








































// const { data: messages = [], isLoading } = useQuery({
//   queryKey: ['messages', selectedUser?.id],
//   queryFn: async () => {
//     if (!selectedUser?.id) return [];
//     const response = await axios.get(`/api/chat/messages?userId=${selectedUser.id}`);
//     // const response = await getMessages(conversationId);
//     if (!response.data) {
//       throw new Error('Failed to fetch messages');
//     }
//     const data = response.data;
//     setLocalMessages(data);
//     return data;
//   },
//   enabled: !!selectedUser?.id,
// });

// const {
//   execute: fetchMessages,
//   isPending: isMessagesLoading,
//   error: messagesError
// } = useServerAction(getMessages, {
//   onSuccess: (result) => {
//     console.log("✅ fetchMessages success:", result);
//   },
//   onError: (error) => {
//     console.log("❌ fetchMessages error:", error);
//   }
// });
'use client';

import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { Sidebar } from './sidebar';
import { ChatWindow } from './chat-window';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

const queryClient = new QueryClient();


function ChatContent({ currentUser }: { currentUser: User }) {

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

    const router = useRouter();


  const { mutate: createOrGetConversation, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/conversation', { // use axios 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }); // no fetch only axios 

      if (!response.ok) {
        throw new Error('Failed to create/fetch conversation');
      }
      const data = await response.json();


      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        setConversationId(data.id.toString()); // no  to String methods
        router.push(`/chat?conversationId=${data.id.toString()}`);
      }
    },
    onError: (error) => {
      console.error('Error creating/fetching conversation:', error);
    },
  });



  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        onUserSelect={(user) => {
          setSelectedUser(user);
          createOrGetConversation(user.id.toString());
        }}
      />
      <ChatWindow
        selectedUser={selectedUser}
        currentUser={currentUser}
        conversationId={conversationId}
      />
      <Toaster />
    </div>
  );
}


// we are yusing layout --  npo use here 
export function ChatLayout({ currentUser }: { currentUser: User }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatContent currentUser={currentUser} />
    </QueryClientProvider>
  );
}

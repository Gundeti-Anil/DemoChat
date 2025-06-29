'use client';

import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { Sidebar } from './sidebar';
import { ChatWindow } from './chat-window';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       refetchOnMount: false,
//       refetchInterval: false,
//       retry: 1,
//     },
//   },
// });

const queryClient = new QueryClient();

function ChatContent({ currentUser }: { currentUser: User }) {

  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { mutate: createOrGetConversation, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      const response = await axios.post('/api/conversation', JSON.stringify({ userId }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data) {
        throw new Error('Failed to create/fetch conversation');
      }
      const data = response.data;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        setConversationId(data.id.toString());
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

export function ChatLayout({ currentUser }: { currentUser: User }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatContent currentUser={currentUser} />
    </QueryClientProvider>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from '@/lib/types';
import axios from 'axios';
import { pusher } from '@/lib/pusher';

interface SidebarProps {
  onUserSelect: (user: User) => void;
}


export function Sidebar({ onUserSelect }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/chat/users');
      return response.data.map((user: any) => ({
        ...user,
        isOnline: false,
        avatar: user.image || ''
      }));
    },
    staleTime: 5 * 60 * 1000,
  });



  useEffect(() => {

    const channel = pusher.subscribe('presence-online-users');
    channel.bind('pusher:subscription_succeeded', (members: any) => {
      const onlineUserIds = new Set<string>();
      members.each((member: any) => {

        onlineUserIds.add(member.id);

      });
      setOnlineUsers(onlineUserIds);
    });

    channel.bind('pusher:member_added', (member: any) => {

      setOnlineUsers(prev => new Set([...prev, member.id]));

    });

    channel.bind('pusher:member_removed', (member: any) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(member.id);
        return newSet;
      });
    });



    return () => {
      channel.unbind_all();
      pusher.unsubscribe('presence-online-users');
    };

  }, []);

  const usersWithStatus = users.map((user: User) => ({
    ...user,
    isOnline: onlineUsers.has(user.id.toString())
  }));
  const filteredUsers = usersWithStatus.filter((user: User) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (isLoading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full items-center justify-center p-4 text-center">
        <p className="text-red-500">Failed to load users. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user: User) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {user.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No users found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
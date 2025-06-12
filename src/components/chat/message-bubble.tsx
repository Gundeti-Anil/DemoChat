'use client';

import { format } from 'date-fns';
import { CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message, User } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  currentUser: User | null;
  showAvatar?: boolean;
}

export function MessageBubble({
  message,
  currentUser,
  showAvatar = true
}: MessageBubbleProps) {

  const isOwnMessage = message.senderId === currentUser?.id;

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[70%]",
        isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          {/* <AvatarImage src={message.sender.avatar} alt={message.sender.name} /> */}
          <AvatarFallback className="text-xs">
            {/* {message.sender.name} */}
            {/* .name.split(' ').map(n => n[0]).join('')} */}
          </AvatarFallback>
        </Avatar>
      )}

      {!showAvatar && !isOwnMessage && (
        <div className="h-8 w-8 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div className={cn("flex flex-col", isOwnMessage && "items-end")}>
        {/* Sender name (only for other users) */}
        {!isOwnMessage && (
          <p className="text-xs text-gray-500 mb-1 px-1">
            {/* {message.sender.name} */}
          </p>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "relative px-4 py-2 rounded-2xl max-w-full break-words",
            isOwnMessage
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-gray-100 text-gray-900 rounded-bl-md"
          )}
        >
          {/* Message content */}
          {message.body && (
            <p className="leading-relaxed">{message.body}</p>
          )}

          {message.image && (
            <img
              src={message.image}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg mt-2"
            />
          )}

          {message.doc && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-black/10 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">Document</p>
                <p className="text-xs opacity-75">{message.doc}</p>
              </div>
            </div>
          )}

          {/* Message time and status */}
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs",
              isOwnMessage ? "text-blue-100" : "text-gray-500",
              "justify-end"
            )}
          >
            <span>
              {format(new Date(message.createdAt), 'HH:mm')} // utc time u should convert to ist 
              
            </span>
            {isOwnMessage && <CheckCheck className="h-3 w-3 text-blue-100" />}
          </div>
        </div>
      </div>
    </div>
  );
}

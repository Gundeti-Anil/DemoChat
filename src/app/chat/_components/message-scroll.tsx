
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { Message, User } from "@/lib/types";
import { useRef, useState, useEffect } from "react";

export function MessageScroll({
    localMessages,
    isLoading,
    currentUser,

}: {
    localMessages: Message[];
    isLoading: boolean;
    currentUser: User;

}) {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle auto-scroll
    useEffect(() => {
        if (autoScroll) {
            scrollToBottom();
        }
    }, [localMessages, autoScroll]);



    // Handle scroll events to determine if user is at bottom
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
        setAutoScroll(isAtBottom);
    };

    return (
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
                ) : localMessages.length === 0 ? (
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
    );
}
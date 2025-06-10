export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: Date;
}

export interface Message {
    id: string;
    body?: string;
    image?: string;
    doc?: string;
    createdAt: Date;
    conversationId: string;
    senderId: number;
    sender: User;
    seen: User[];
}

export interface Conversation {
    id: string;
    createdAt: Date;
    lastMessageAt: Date;
    name?: string;
    messages: Message[];
    users: User[];
    lastMessage?: Message;
    unreadCount?: number;
}

export interface CreateMessageRequest {
    body?: string;
    image?: string;
    doc?: string;
    conversationId: string;
}

export interface CreateConversationRequest {
    userId: number;
}

export interface MarkSeenRequest {
    messageIds: string[];
}
import { Message, User } from '@/lib/types';

export interface MessageInputProps {
    onSendMessage: (message: string) => void;
    onFileUpload?: (file: File) => void;
    disabled?: boolean;
    placeholder?: string;
}

export interface MessageBubbleProps {
    message: Message;
    currentUser: User | null;
    showAvatar?: boolean;
}

export interface ChatWindowProps {
    selectedUser: User | null;
    currentUser: User | null;
    conversationId: string | null;
}

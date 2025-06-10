// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';
// import { Conversation, Message, User } from '../lib/types';

// interface ChatState {
//   // Current user
//   currentUser: User | null;
//   setCurrentUser: (user: User) => void;

//   // Users
//   users: User[];
//   setUsers: (users: User[]) => void;
//   updateUserStatus: (userId: number, isOnline: boolean) => void;

//   // Conversations
//   conversations: Conversation[];
//   setConversations: (conversations: Conversation[]) => void;
//   addConversation: (conversation: Conversation) => void;
//   updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;

//   // Selected conversation
//   selectedConversationId: string | null;
//   setSelectedConversation: (conversationId: string | null) => void;

//   // Messages
//   messages: Record<string, Message[]>;
//   setMessages: (conversationId: string, messages: Message[]) => void;
//   addMessage: (conversationId: string, message: Message) => void;
//   addOptimisticMessage: (conversationId: string, message: Message) => void;
//   removeOptimisticMessage: (conversationId: string, tempId: string) => void;
//   updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;

//   // UI state
//   isTyping: Record<string, number[]>; // conversationId -> userIds
//   setTyping: (conversationId: string, userId: number, typing: boolean) => void;
// }

// export const useChatStore = create<ChatState>()(
//   devtools(
//     (set, get) => ({
//       // Current user
//       currentUser: null,
//       setCurrentUser: (user) => set({ currentUser: user }),

//       // Users
//       users: [],
//       setUsers: (users) => set({ users }),
//       updateUserStatus: (userId, isOnline) =>
//         set((state) => ({
//           users: state.users.map((user) =>
//             user.id === userId ? { ...user, isOnline, lastSeen: isOnline ? undefined : new Date() } : user
//           ),
//         })),

//       // Conversations
//       conversations: [],
//       setConversations: (conversations) => set({ conversations }),
//       addConversation: (conversation) =>
//         set((state) => ({
//           conversations: [conversation, ...state.conversations],
//         })),
//       updateConversation: (conversationId, updates) =>
//         set((state) => ({
//           conversations: state.conversations.map((conv) =>
//             conv.id === conversationId ? { ...conv, ...updates } : conv
//           ),
//         })),

//       // Selected conversation
//       selectedConversationId: null,
//       setSelectedConversation: (conversationId) => set({ selectedConversationId: conversationId }),

//       // Messages
//       messages: {},
//       setMessages: (conversationId, messages) =>
//         set((state) => ({
//           messages: { ...state.messages, [conversationId]: messages },
//         })),
//       addMessage: (conversationId, message) =>
//         set((state) => {
//           const existingMessages = state.messages[conversationId] || [];
//           const messageExists = existingMessages.some((m) => m.id === message.id);

//           if (messageExists) {
//             return state; // Don't add duplicate
//           }

//           const updatedMessages = [...existingMessages, message].sort(
//             (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//           );

//           // Update conversation's last message
//           const updatedConversations = state.conversations.map((conv) => {
//             if (conv.id === conversationId) {
//               return {
//                 ...conv,
//                 lastMessage: message,
//                 lastMessageAt: message.createdAt,
//               };
//             }
//             return conv;
//           });

//           return {
//             messages: { ...state.messages, [conversationId]: updatedMessages },
//             conversations: updatedConversations,
//           };
//         }),
//       addOptimisticMessage: (conversationId, message) =>
//         set((state) => {
//           const existingMessages = state.messages[conversationId] || [];
//           return {
//             messages: { ...state.messages, [conversationId]: [...existingMessages, message] },
//           };
//         }),
//       removeOptimisticMessage: (conversationId, tempId) =>
//         set((state) => {
//           const existingMessages = state.messages[conversationId] || [];
//           return {
//             messages: {
//               ...state.messages,
//               [conversationId]: existingMessages.filter((m) => m.id !== tempId),
//             },
//           };
//         }),
//       updateMessage: (conversationId, messageId, updates) =>
//         set((state) => {
//           const existingMessages = state.messages[conversationId] || [];
//           return {
//             messages: {
//               ...state.messages,
//               [conversationId]: existingMessages.map((m) =>
//                 m.id === messageId ? { ...m, ...updates } : m
//               ),
//             },
//           };
//         }),

//       // UI state
//       isTyping: {},
//       setTyping: (conversationId, userId, typing) =>
//         set((state) => {
//           const currentTyping = state.isTyping[conversationId] || [];
//           const newTyping = typing
//             ? [...currentTyping.filter((id) => id !== userId), userId]
//             : currentTyping.filter((id) => id !== userId);

//           return {
//             isTyping: { ...state.isTyping, [conversationId]: newTyping },
//           };
//         }),
//     }),
//     { name: 'chat-store' }
//   )
// );
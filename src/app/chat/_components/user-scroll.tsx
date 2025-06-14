import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserScroll({ users, onUserSelect }: { users: User[]; onUserSelect: (user: User) => void }) {
    return (
        <ScrollArea className="flex-1">
            <div className="p-2">
                {users.length > 0 ? (
                    users.map((user: User) => (
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
    )
}
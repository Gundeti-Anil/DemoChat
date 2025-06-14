import { db } from "@/lib/db";
import { getCurrentUser } from "@/app/actions/get-current-user";
import { revalidateTag } from "next/cache";
import { pusherServer } from "@/lib/pusher";

export const editMessage = async (messageId: string, body: string) => {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.email) {
            return null;
        }

        const updatedMessage = await db.message.update({
            where: {
                id: messageId,
            },
            data: {
                body: body,
            },
            include: {
                conversation: true,
            },
        });
        await pusherServer.trigger(`private-chat-${updatedMessage?.conversation.id}`, "editMessage", updatedMessage);
        revalidateTag(`conversation-${updatedMessage?.conversation.id}`);

        if (!updatedMessage) {
            return null;
        }

        return updatedMessage;


    } catch (error) {
        throw new Error(error as string);
    }
};



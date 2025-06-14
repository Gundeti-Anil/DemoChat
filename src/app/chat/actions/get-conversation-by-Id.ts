import { db } from "@/lib/db";
import getCurrentUser from "../../actions/getCurrentUser";

export const getConversationById = async (conversationId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.email) {
      return null;
    }

    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
      },
    });

    if (!conversation) {
      return null;
    }

    return conversation;
  } catch (error) {
    // console.log(error);
    // return null;
    throw new Error(error as string);
  }
};

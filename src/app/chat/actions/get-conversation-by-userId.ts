import { db } from "@/lib/db";

export const getConversationByUserId = async (currentUserId: number, userId: number) => {
  try {
    const conversation = await db.conversation.findFirst({
      where: {
        users: {
          every: {
            id: {
              in: [currentUserId, userId]
            }
          }
        }
      },
    });

    return conversation;
  } catch (error) {
    // console.log(error);
    // return null;
    throw new Error(error as string);
  }
};


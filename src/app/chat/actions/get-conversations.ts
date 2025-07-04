import { db } from "@/lib/db";
import { getCurrentUser } from "../../actions/get-current-user";

export const getConversations = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id || !currentUser?.email) {
    return null;
  }

  try {
    const conversations = await db.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc",
      },
      where: {
        users: {
          some: {
            id: currentUser.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            seen: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return conversations;
  } catch (error) {
    // console.log("[CONVERSATIONS_ERROR]", error);
    // return null;
    throw new Error(error as string);
  }
};

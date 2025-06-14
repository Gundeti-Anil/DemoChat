'use server'

import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { createServerAction } from "zsa";

// Define the input schema
const getMessagesInput = z.object({
  conversationId: z.string(),
});

export const getMessages = createServerAction()
  .input(getMessagesInput)
  .handler(async ({ input }) => {
    const { conversationId } = input

    try {
      const messages = await db.message.findMany({
        where: {
          conversationId: conversationId
        },
        orderBy: {
          createdAt: 'asc'
        },
        // include: {
        //   sender: {
        //     select: {
        //       id: true,
        //       name: true,
        //       image: true
        //     }
        //   }
        // }
      })

      return messages
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      throw new Error('Failed to fetch messages')
    }
  })

// export const getMessages = createServerAction()
//   .input(getMessagesInput)
//   .handler(async ({ input }) => {
//     if (!input.conversationId) return { data: null, error: "No conversation ID provided" };
//     console.log(input.conversationId);
//     const getCachedMessages = unstable_cache(
//       async () => {
//         console.log("in cache")
//         try {
//           const messages = await db.message.findMany({
//             where: { conversationId: input.conversationId },
//             orderBy: { createdAt: "desc" },
//           });
//           console.log(messages);
//           return { data: messages, error: null };
//         } catch (error) {
//           return { data: null, error: error as Error };
//         }
//       },
//       [`messages-${input.conversationId}`],
//       {
//         tags: [`conversation-${input.conversationId}`, 'messages'],
//         revalidate: 300,
//       }
//     );

//     try {
//       const result = await getCachedMessages();
//       console.log(result);
//       return result;
//     } catch (error) {
//       return { data: null, error: error as Error };
//     }
//   });
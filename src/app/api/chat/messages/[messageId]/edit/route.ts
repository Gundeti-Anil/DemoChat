import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/utils/auth";
import { revalidateTag } from "next/cache";
import { pusherServer } from "@/lib/pusher";

export async function POST(
    req: NextRequest,
) {
    try {
        const url = new URL(req.url);
        const messageId = url.pathname.split('/')[4];
        const currentUser = await getCurrentUser();

        if (!currentUser?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        console.log("MessageId", messageId);

        const { body } = await req.json();

        const message = await db.message.findUnique({
            where: {
                id: messageId,
            },
            include: {
                conversation: true,
            },
        });

        if (!messageId) {
            return new NextResponse("Bad Request", { status: 400 });
        }

        console.log("Message", message);

        const updatedMessage = await db.message.update({
            where: {
                id: messageId,
            },
            data: {
                body: body,
            },
        });
        await pusherServer.trigger(`private-chat-${message?.conversation.id}`, "editMessage", updatedMessage);
        revalidateTag(`conversation-${message?.conversation.id}`);

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.log("Error in Editing Message", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
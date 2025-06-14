import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getCurrentUser } from "@/app/actions/get-current-user";

// interface PusherAuthBody {
// 	socket_id: string;
// 	channel_name: string;
// }

export async function POST(
	req: NextRequest,
) {
	try {

		const currentUser = await getCurrentUser();

		if (!currentUser?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}


		// const body = await req.json();
		const formData = await req.formData();
		const socket_id = formData.get("socket_id") as string;
		const channel_name = formData.get("channel_name") as string;

		// console.log("body", body)

		// const { socket_id, channel_name } = body as PusherAuthBody;

		// Validate required fields
		if (!socket_id || typeof socket_id !== 'string') {
			return NextResponse.json({ error: "Invalid socket_id" }, { status: 400 });
		}

		if (!channel_name || typeof channel_name !== 'string') {
			return NextResponse.json({ error: "Invalid channel_name" }, { status: 400 });
		}

		const presenceData = {
			user_id: currentUser.id.toString(),
			user_info: {
				name: currentUser.name || '',
				email: currentUser.email || '',
			},
		};

		let auth;

		if (channel_name.startsWith("private-")) {
			auth = pusherServer.authorizeChannel(socket_id, channel_name);
		} else if (channel_name.startsWith("presence-")) {
			auth = pusherServer.authorizeChannel(socket_id, channel_name, presenceData);
		} else {
			return NextResponse.json({ error: "Invalid channel type" }, { status: 400 });
		}

		return NextResponse.json(auth);
	} catch (error) {
		console.error("Pusher auth error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
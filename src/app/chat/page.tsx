import { ChatLayout } from "./_components/chat-layout"
import getCurrentUser from "@/app/actions/getCurrentUser"
import { redirect } from "next/navigation";
import { getUsers } from "./actions/get-users";
// 
export default async function ChatPage() {
  try {
    const users = await getUsers();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/auth/signin'); // or any other route
    }
    return (
      <div className="h-screen bg-background">
        {/* @ts-ignore */}
        <ChatLayout currentUser={currentUser} users={users} />
      </div>
    );
  } catch (error) {
    console.error("Error in ChatPage:", error);
    return <div>Error loading chat</div>;
  }
}

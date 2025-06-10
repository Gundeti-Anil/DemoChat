import { ChatLayout } from "@/components/chat/chat-layout"
import getCurrentUser from "@/app/actions/getCurrentUser"
import { redirect } from "next/navigation";
// 
export default async function ChatPage() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/auth/signin'); // or any other route
    }
    return (
      <div className="h-screen bg-background">
        {/* @ts-ignore */}
        <ChatLayout currentUser={currentUser} />
      </div>
    );
  } catch (error) {
    console.error("Error in ChatPage:", error);
    return <div>Error loading chat</div>;
  }
}

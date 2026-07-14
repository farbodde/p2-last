import AuthGuard from "@/components/common/Auth/AuthGuard";
import ChatList from "@/components/features/Chat/ChatList";

export default function ChatPage() {
  return (
    <AuthGuard mode="protected" redirectTo="/auth">
      <ChatList />
    </AuthGuard>
  );
}

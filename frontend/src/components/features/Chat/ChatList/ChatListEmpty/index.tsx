import { MessagesIcon } from "@/components/common/icons";
import Header from "@/components/layouts/Header";

const ChatListEmpty = () => {
  return (
    <>
      <Header title="Chat" scrollTop={25} />
      <section className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <MessagesIcon className="w-24 h-24 text-white/70" />
        <span className="text-sm text-white/60">No messages here yet...</span>
      </section>
    </>
  );
};

export default ChatListEmpty;

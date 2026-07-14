import ChatConversation from "@/components/features/Chat/ChatConversation";
import ChatHeader from "@/components/features/Chat/ChatHeader";
import { getLfgDetail } from "@/services/lfg.service";
import { getPublicProfile } from "@/services/profile.service";

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getFirstSearchParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const ChatMessagingPage = async ({ params, searchParams }: PageProps) => {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;
  const lfgParam = getFirstSearchParam(resolvedSearchParams.lfg);
  const chatIdParam = getFirstSearchParam(resolvedSearchParams.chatId);
  const lfgId = Number(lfgParam);
  const shouldFetchLfg = Number.isInteger(lfgId) && lfgId > 0;
  const resolvedChatId = chatIdParam?.trim() || null;

  const [profile, lfg] = await Promise.all([
    getPublicProfile(username).catch(() => null),
    shouldFetchLfg ? getLfgDetail(lfgId).catch(() => null) : null,
  ]);
  const headerUser = {
    displayName: profile?.displayName ?? username,
    username: profile?.username ?? username,
    profileImage: profile?.profileImage ?? null,
  };

  return (
    <div className="min-h-screen pb-20">
      <ChatHeader user={headerUser} gameTitle={lfg?.gameTitle ?? null} />

      <ChatConversation chatId={resolvedChatId} peerUsername={username} />
    </div>
  );
};

export default ChatMessagingPage;

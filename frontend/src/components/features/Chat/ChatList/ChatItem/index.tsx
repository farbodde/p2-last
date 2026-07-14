import type { Chat } from "@/@types/chat.type";
import { resolveContentAssetUrl } from "@/services/content.service";
import Image from "next/image";
import Link from "next/link";

type Props = {
  chat: Chat;
};

const formatChatTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return new Intl.DateTimeFormat("en", {
    ...(isToday
      ? { hour: "numeric", minute: "2-digit" }
      : { month: "short", day: "numeric" }),
  }).format(date);
};

const ChatItem: React.FC<Props> = ({ chat }) => {
  const userName =
    chat.other_user.display_name.trim() ||
    chat.other_user.username?.trim() ||
    "Player";
  const profileImage =
    resolveContentAssetUrl(chat.other_user.profile_image) ?? "/images/logo.png";
  const preview = chat.last_message?.content.trim() || "No messages yet.";
  const timestamp = formatChatTime(
    chat.last_message?.created_at ?? chat.created_at,
  );
  const routeUsername = chat.other_user.username?.trim() || String(chat.id);

  return (
    <Link
      href={`/chat/${encodeURIComponent(routeUsername)}?chatId=${encodeURIComponent(
        String(chat.id),
      )}`}
      className="flex items-center gap-3"
    >
      <span className="relative ps-4">
        <span className="block h-14 w-14 overflow-hidden rounded-full border-2 border-white/10">
          <Image
            src={profileImage}
            alt={userName}
            width={128}
            height={128}
            unoptimized={
              profileImage.startsWith("http://") ||
              profileImage.startsWith("https://")
            }
            className="h-full w-full object-cover object-center"
          />
        </span>
      </span>

      <span className="flex h-18 min-w-0 flex-1 flex-col justify-center gap-0.5 border-b border-black/10 pr-4">
        <span className="flex gap-2 justify-between items-center">
          <span className="truncate text-lg font-medium">{userName}</span>
          {timestamp ? (
            <span className="shrink-0 text-sm text-white/40">{timestamp}</span>
          ) : null}
        </span>
        <span className="flex gap-2 justify-between items-center">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs text-white/30">
              {chat.title}
            </span>
            <span className="block truncate text-white/40">{preview}</span>
          </span>
        </span>
      </span>
    </Link>
  );
};

export default ChatItem;

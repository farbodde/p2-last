import React from "react";

const messageRows = [
  { side: "right", width: "w-52" },
  { side: "left", width: "w-64" },
  { side: "left", width: "w-36" },
  { side: "right", width: "w-48" },
  { side: "left", width: "w-56" },
] as const;

const ChatMessagingHeaderSkeleton = () => {
  return (
    <div className="sticky top-0 left-0 z-20 w-full bg-background">
      <div className="flex items-center justify-between gap-3 py-4 px-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-white/5" />

        <div className="flex flex-1 items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/5" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
          </div>
        </div>

        <div className="h-8 w-8 animate-pulse rounded-full bg-white/5" />
      </div>
    </div>
  );
};

const ChatMessagingMessagesSkeleton = () => {
  return (
    <section className="flex flex-col gap-8 p-4">
      <div className="mx-auto h-7 w-20 animate-pulse rounded-full bg-white/5" />

      <div className="flex flex-col gap-3">
        {messageRows.map((row, index) => (
          <div
            key={`${row.side}-${row.width}-${index}`}
            className={`h-11 ${row.width} animate-pulse rounded-lg bg-white/5 ${
              row.side === "right" ? "ml-auto" : ""
            }`}
          />
        ))}
      </div>
    </section>
  );
};

const ChatMessagingPageSkeleton = () => {
  return (
    <div className="min-h-screen pb-20">
      <ChatMessagingHeaderSkeleton />
      <ChatMessagingMessagesSkeleton />

      <div className="fixed inset-x-0 bottom-0 z-20 bg-background p-4">
        <div className="h-12 animate-pulse rounded-full bg-white/5" />
      </div>
    </div>
  );
};

export default ChatMessagingPageSkeleton;

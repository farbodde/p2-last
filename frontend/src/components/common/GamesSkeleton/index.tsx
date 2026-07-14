import React from "react";

type Props = {
  count?: number;
  inline?: boolean;
};

const GamesSkeletonItems = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-white/5"
      />
    ))}
  </>
);

const GamesSkeleton = ({ count = 6, inline = false }: Props) => {
  if (inline) {
    return <GamesSkeletonItems count={count} />;
  }

  return (
    <section
      className="overflow-auto scrollbar-hide scroll-smooth"
      aria-label="Loading games"
      aria-busy="true"
    >
      <div className="flex w-fit gap-2 px-4 py-2">
        <GamesSkeletonItems count={count} />
      </div>
    </section>
  );
};

export default GamesSkeleton;

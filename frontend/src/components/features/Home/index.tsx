import { getGames, getHomeFeed } from "@/services/content.service";
import Alert from "@/components/common/Alert";
import LFGFloatButton from "@/components/common/LFGFloatButton";
import HomeFeed from "@/components/features/Home/HomeFeed";
import HomeFilters from "@/components/features/Home/HomeFilters";
import HomeGamesFilter from "@/components/features/Home/HomeGameFilter";
import MainHeader from "@/components/layouts/MainHeader";
import type { GameFilterItemType } from "@/@types/game.type";
import { getApiErrorList } from "@/helpers/api-error";
import type { LFGFeedFilters } from "@/@types/lfg.type";

type HomeViewProps = {
  activeGameKey?: string | null;
  feedFilters?: LFGFeedFilters;
};

const getErrorLogPayload = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    };
  }

  return { error };
};

const HomeView = async ({
  activeGameKey = null,
  feedFilters = {},
}: HomeViewProps) => {
  let initialFeedPage: Awaited<ReturnType<typeof getHomeFeed>> = {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
  let feedErrorMessage: string | null = null;
  let gameFilterItems: GameFilterItemType[] = [];
  let gamesErrorMessage: string | null = null;

  try {
    initialFeedPage = await getHomeFeed({
      page: 1,
      filters: feedFilters,
    });
  } catch (error) {
    console.error("[HomeView] Failed to load LFG feed", {
      feedFilters,
      error: getErrorLogPayload(error),
    });
    feedErrorMessage = getApiErrorList(
      error,
      "Failed to load LFG posts. Please try again.",
    )[0];
  }

  try {
    const games = await getGames();
    gameFilterItems = games.map((game) => ({
      id: game.id,
      key: game.key,
      title: game.title,
      imageUrl: game.imageUrl,
    }));
  } catch (error) {
    console.error("[HomeView] Failed to load games", {
      activeGameKey,
      error: getErrorLogPayload(error),
    });
    gamesErrorMessage = getApiErrorList(
      error,
      "Failed to load games. Please try again.",
    )[0];
  }

  return (
    <>
      <MainHeader />
      <HomeGamesFilter
        items={gameFilterItems}
        activeGameKey={activeGameKey}
        errorMessage={gamesErrorMessage}
      />
      <HomeFilters />

      {feedErrorMessage ? (
        <section className="px-4">
          <Alert
            type="error"
            title="Unable to load LFG posts"
            message={feedErrorMessage}
            dismissible={false}
          />
        </section>
      ) : null}
      <HomeFeed initialFeedPage={initialFeedPage} filters={feedFilters} />
      <LFGFloatButton />
    </>
  );
};

export default HomeView;

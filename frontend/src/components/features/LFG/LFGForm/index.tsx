import Header from "@/components/layouts/Header";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import LFGGameItem from "./LFGGameItem";
import LFGPlatformItem from "./LFGPlatformItem";
import CheckboxRow from "@/components/base/Form/CheckboxRow";
import clsx from "clsx";
import Button from "@/components/base/Button";
import SelectController from "@/components/base/Form/SelectController";
import TextareaController from "@/components/base/Form/TextareaController";
import {
  CrossPlayIcon,
  MicOffIcon,
  MicOnIcon,
} from "@/components/common/icons";
import { useGamesQuery } from "@/hooks/queries/useGamesQuery";
import Alert from "@/components/common/Alert";
import type { LFGFormData } from "@/@types/lfg.type";
import { useGameCategoriesQuery } from "@/hooks/queries/useGameCategoriesQuery";

type Props = {
  id?: number;
  initialData?: LFGFormData | null;
  onDone: (data: LFGFormData) => void;
};

type LFGFormFields = Pick<LFGFormData, "skill" | "description">;

const LFGForm: React.FC<Props> = ({ id, initialData, onDone }) => {
  const [game, setGame] = useState<string | null>(
    initialData ? String(initialData.gameId) : null,
  );
  const [platform, setPlatform] = useState<string | null>(
    initialData ? String(initialData.platformId) : null,
  );
  const [crossPlay, setCrossPlay] = useState<boolean>(
    initialData?.allowCrossPlay ?? false,
  );
  const [mic, setMic] = useState<boolean>(initialData?.mic ?? false);
  const { control, handleSubmit, setValue } = useForm<LFGFormFields>({
    defaultValues: {
      skill: initialData?.skill ?? "any",
      description: initialData?.description ?? "",
    },
  });
  const {
    data: games = [],
    error: gamesError,
    isError: isGamesError,
    isLoading: isGamesLoading,
  } = useGamesQuery();

  const selectedGame = useMemo(
    () => games.find((item) => item.key === game),
    [game, games],
  );
  const {
    data: categoriesData,
    isError: isCategoriesError,
    isLoading: isCategoriesLoading,
  } = useGameCategoriesQuery(selectedGame?.id ?? null);
  const skillCategory = useMemo(
    () =>
      categoriesData?.results.find(
        (category) =>
          category.category_title.trim().toLowerCase() === "skill",
      ),
    [categoriesData],
  );
  const skillOptions = useMemo(
    () =>
      skillCategory
        ? skillCategory.items.map((item) => ({
            label: item.title,
            value: String(item.id),
          }))
        : [{ label: "Any", value: "any" }],
    [skillCategory],
  );

  useEffect(() => {
    if (!selectedGame || isCategoriesLoading || isCategoriesError) {
      return;
    }

    const initialSkillIsValid =
      initialData?.gameId === selectedGame.id &&
      skillOptions.some((option) => option.value === initialData.skill);

    setValue(
      "skill",
      initialSkillIsValid ? initialData.skill : skillOptions[0]?.value ?? "any",
    );
  }, [
    initialData,
    isCategoriesError,
    isCategoriesLoading,
    selectedGame,
    setValue,
    skillOptions,
  ]);

  const handleGameChange = useCallback((gameKey: string) => {
    setGame(gameKey);
    setPlatform(null);
  }, []);

  const onSubmit = handleSubmit((formData) => {
    if (!selectedGame || !platform) {
      return;
    }

    onDone({
      gameId: selectedGame.id,
      platformId: Number(platform),
      allowCrossPlay: crossPlay,
      mic,
      skill: formData.skill,
      description: formData.description,
    });
  });

  return (
    <section className="flex flex-col min-h-screen">
        <Header hasBack title={id ? "Edit LFG" : "Create LFG"} />
        <div className="flex flex-col gap-6 py-4">
          <section className="flex flex-col gap-2 w-full">
            <div className="px-4">
              <h3 className="font-medium">Select Game</h3>
            </div>
            <div className="overflow-auto scrollbar-hide scroll-smooth">
              <div className="flex gap-1.5 w-fit px-4">
                {isGamesLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 w-20 animate-pulse rounded-lg bg-white/10"
                    />
                  ))
                ) : null}

                {!isGamesLoading && games.length === 0 ? (
                  <div className="w-[calc(100vw-2rem)]">
                    <Alert
                      type={isGamesError ? "error" : "info"}
                      title={isGamesError ? "Unable to load games" : undefined}
                      message={
                        isGamesError
                          ? gamesError instanceof Error
                            ? gamesError.message
                            : String(gamesError)
                          : "No games are available yet."
                      }
                      dismissible={false}
                    />
                  </div>
                ) : null}

                {games.map((item) => (
                  <LFGGameItem
                    key={item.key}
                    item={item}
                    isActive={game === item.key}
                    onChange={handleGameChange}
                  />
                ))}
              </div>
            </div>
          </section>

          <form
            id="lfgForm"
            onSubmit={onSubmit}
            className="flex flex-col gap-6 px-4"
          >
            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Platform</h3>
                <span className="text-xs text-[#F43F5E]">
                  Select your platform
                </span>
              </div>
              <div className="flex gap-4 w-full overflow-x-auto scrollbar-hide">
                {selectedGame?.platforms.map((item) => (
                  <LFGPlatformItem
                    key={item.id}
                    item={item}
                    isActive={platform === String(item.id)}
                    onChange={(platformId) =>
                      setPlatform(String(platformId))
                    }
                  />
                ))}
              </div>

              {!selectedGame ? (
                <span className="text-sm text-white/40">
                  Select a game to see its platforms.
                </span>
              ) : null}

              {selectedGame && selectedGame.platforms.length === 0 ? (
                <span className="text-sm text-white/40">
                  No platforms are available for this game.
                </span>
              ) : null}

              <CheckboxRow
                label={
                  <span className="flex gap-2 items-center">
                    <CrossPlayIcon className="w-5 h-5" />
                    <span>Allow Cross-Play</span>
                  </span>
                }
                value={crossPlay}
                name="cross-play"
                className={clsx(
                  "w-full py-2 flex mt-2 items-center rounded-lg border transition",
                  {
                    "border-primary text-primary": crossPlay,
                    "border-white/10": !crossPlay,
                  },
                )}
                onChange={setCrossPlay}
              />
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="font-medium">Mic</h3>

              <div className="flex items-center gap-4">
                <Button
                  fullWidth
                  variant="bordered"
                  color="danger"
                  className={clsx("border", {
                    "border-white/20": mic,
                  })}
                  onPress={() => setMic(false)}
                >
                  <MicOffIcon className="w-5 h-5" />
                </Button>
                <Button
                  fullWidth
                  variant="bordered"
                  color="success"
                  className={clsx("border", {
                    "border-white/20": !mic,
                  })}
                  onPress={() => setMic(true)}
                >
                  <MicOnIcon className="w-5 h-5" />
                </Button>
              </div>
            </section>

            <SelectController
              control={control}
              name="skill"
              label="Skill"
              options={skillOptions}
              isDisabled={
                !selectedGame ||
                isCategoriesLoading ||
                isCategoriesError ||
                skillOptions.length === 0
              }
              rules={{ required: "Skill is required" }}
            />

            <TextareaController
              control={control}
              name="description"
              label="Description"
              rows={4}
            />
          </form>
        </div>

        <div className="sticky mt-auto z-20 bottom-0">
          <div className="bg-tab/80 p-4 backdrop-blur-[2px]">
            <Button
              fullWidth
              isDisabled={!game || !platform || isGamesLoading}
              type="submit"
              form="lfgForm"
              color="primary"
            >
              Continue
            </Button>
          </div>
        </div>
    </section>
  );
};

export default LFGForm;

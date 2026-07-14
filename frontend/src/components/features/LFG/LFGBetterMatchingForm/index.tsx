import { useCallback, useMemo, useState } from "react";
import Header from "@/components/layouts/Header";
import Button from "@/components/base/Button";
import MatchingSection from "./MatchingSection";
import ImageUploader, {
  type UploadFileItem,
} from "@/components/base/Form/ImageUploader";
import Alert from "@/components/common/Alert";
import { useGameCategoriesQuery } from "@/hooks/queries/useGameCategoriesQuery";
import { useGameModesQuery } from "@/hooks/queries/useGameModesQuery";
import type {
  LFGDetailViewData,
  LFGFormData,
  UpdateLFGRequest,
} from "@/@types/lfg.type";
import { useCreateLfgMutation } from "@/hooks/mutations/useCreateLfgMutation";
import { useUpdateLfgMutation } from "@/hooks/mutations/useUpdateLfgMutation";
import { getApiErrorList } from "@/helpers/api-error";
import { addToast } from "@heroui/react";
import { useRouter } from "next/navigation";

type Props = {
  id?: number;
  lfgData: LFGFormData | null;
  initialDetail?: LFGDetailViewData;
  onClose: () => void;
};

const normalizeTitle = (value: string) => value.trim().toLowerCase();

const LFGBetterMatchingForm: React.FC<Props> = ({
  id,
  lfgData,
  initialDetail,
  onClose,
}) => {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [selectedOverrides, setSelectedOverrides] = useState<
    Record<string, number[]>
  >({});
  const [selectedModeId, setSelectedModeId] = useState<
    number | null | undefined
  >(undefined);
  const gameId = lfgData?.gameId ?? null;
  const {
    data: categoriesData,
    error: categoriesError,
    isError: isCategoriesError,
    isLoading: isCategoriesLoading,
  } = useGameCategoriesQuery(gameId);
  const {
    data: modesData,
    error: modesError,
    isError: isModesError,
    isLoading: isModesLoading,
  } = useGameModesQuery(gameId);
  const isEditingOriginalGame = Boolean(
    id && initialDetail?.gameId === gameId,
  );
  const initialModeId = useMemo(() => {
    if (!isEditingOriginalGame || !modesData) {
      return null;
    }

    return (
      modesData.results.find((mode) => mode.id === initialDetail?.gameModeId)
        ?.id ??
      modesData.results.find(
        (mode) =>
          initialDetail?.gameModeTitle &&
          normalizeTitle(mode.title) ===
            normalizeTitle(initialDetail.gameModeTitle),
      )?.id ??
      null
    );
  }, [initialDetail, isEditingOriginalGame, modesData]);
  const activeModeId =
    selectedModeId === undefined
      ? id
        ? initialModeId
        : (modesData?.results[0]?.id ?? null)
      : selectedModeId;
  const createLfgMutation = useCreateLfgMutation();
  const updateLfgMutation = useUpdateLfgMutation();
  const isSubmitting =
    createLfgMutation.isPending || updateLfgMutation.isPending;
  const matchingCategories =
    categoriesData?.results.filter(
      (category) => category.category_title.trim().toLowerCase() !== "skill",
    ) ?? [];
  const initialItemIds = useMemo(
    () =>
      new Set(
        isEditingOriginalGame
          ? (initialDetail?.selectedItems.map((item) => item.id) ?? [])
          : [],
      ),
    [initialDetail, isEditingOriginalGame],
  );
  const getCategoryValues = useCallback(
    (categoryKey: string, itemIds: number[]) =>
      selectedOverrides[categoryKey] ??
      itemIds.filter((itemId) => initialItemIds.has(itemId)),
    [initialItemIds, selectedOverrides],
  );

  const handleChange = useCallback(
    (key: string, limit: number, values: number[], value: number) => {
      setSelectedOverrides((prev) => {
        if (values.includes(value)) {
          return {
            ...prev,
            [key]: values.filter((item) => item !== value),
          };
        }

        if (limit === 1) {
          return { ...prev, [key]: [value] };
        }

        if (limit !== -1 && values.length >= limit) {
          return prev;
        }

        return { ...prev, [key]: [...values, value] };
      });
    },
    [],
  );

  const onSubmit = async () => {
    if (!lfgData || isSubmitting) {
      return;
    }

    const skillItemId = lfgData.skill === "any" ? null : Number(lfgData.skill);
    const selectedItems = Array.from(
      new Set([
        ...matchingCategories.flatMap((category) =>
          getCategoryValues(
            String(category.category_id),
            category.items.map((item) => item.id),
          ),
        ),
        ...(Number.isFinite(skillItemId) && skillItemId !== null
          ? [skillItemId]
          : []),
      ]),
    );

    try {
      const payload: UpdateLFGRequest = {
        game: lfgData.gameId,
        platform: lfgData.platformId,
        allow_cross_play: lfgData.allowCrossPlay,
        mic_enabled: lfgData.mic,
        game_mode: activeModeId,
        description: lfgData.description,
        selected_items: selectedItems,
        stat_images: files
          .map((file) => file.file)
          .filter((file): file is File => Boolean(file))
          .slice(0, 3),
      };
      const response = id
        ? await updateLfgMutation.mutateAsync(payload)
        : await createLfgMutation.mutateAsync(payload);

      addToast({
        title: id ? "LFG updated" : "LFG created",
        description: response.detail,
        color: "success",
        severity: "success",
      });
      router.replace(id ? `/lfg/${id}` : "/");
      router.refresh();
    } catch (error) {
      const messages = getApiErrorList(
        error,
        id
          ? "Failed to update LFG. Please try again."
          : "Failed to create LFG. Please try again.",
      );

      addToast({
        title: id ? "Unable to update LFG" : "Unable to create LFG",
        description: messages.join(" "),
        color: "danger",
        severity: "danger",
      });
    }
  };

  return (
    <>
      <section className="flex flex-col min-h-screen">
        <Header title="Better Matching (Optional)" onClose={onClose} />
        <div className="flex flex-col gap-8 p-4">
          <div className="relative border border-white/30 rounded-xl pb-3 pt-5">
            <div className="absolute bottom-full left-3 translate-y-1/2 bg-background">
              <h3 className="text-white/50 text-sm px-1">Stats Image</h3>
            </div>
            <ImageUploader
              value={files}
              onChange={setFiles}
              maxFiles={3}
              classNames={{ wrapper: "px-3" }}
            />
          </div>

          {isModesLoading ? (
            <div className="h-20 animate-pulse rounded-xl bg-white/5" />
          ) : null}

          {isModesError ? (
            <Alert
              type="error"
              title="Unable to load game modes"
              message={
                modesError instanceof Error
                  ? modesError.message
                  : String(modesError)
              }
              dismissible={false}
            />
          ) : null}

          {!isModesLoading &&
          !isModesError &&
          modesData?.results.length === 0 ? (
            <Alert
              type="info"
              message="No game modes are available for this game."
              dismissible={false}
            />
          ) : null}

          {modesData?.results.length ? (
            <MatchingSection
              label="Game Mode"
              limit={1}
              items={modesData.results.map((mode) => ({
                ...mode,
                icon: "",
              }))}
              value={activeModeId === null ? [] : [activeModeId]}
              onChange={setSelectedModeId}
            />
          ) : null}

          {isCategoriesLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-white/5"
                />
              ))
            : null}

          {isCategoriesError ? (
            <Alert
              type="error"
              title="Unable to load matching options"
              message={
                categoriesError instanceof Error
                  ? categoriesError.message
                  : String(categoriesError)
              }
              dismissible={false}
            />
          ) : null}

          {!isCategoriesLoading &&
          !isCategoriesError &&
          matchingCategories.length === 0 ? (
            <Alert
              type="info"
              message="No matching categories are available for this game."
              dismissible={false}
            />
          ) : null}

          {matchingCategories.map((category) => {
            const categoryKey = String(category.category_id);
            const categoryValues = getCategoryValues(
              categoryKey,
              category.items.map((item) => item.id),
            );

            return (
              <MatchingSection
                key={category.category_id}
                label={category.category_title}
                limit={category.limit}
                items={category.items}
                value={categoryValues}
                onChange={(value) =>
                  handleChange(
                    categoryKey,
                    category.limit,
                    categoryValues,
                    value,
                  )
                }
              />
            );
          })}
        </div>
        <div className="sticky mt-auto z-20 bottom-0">
          <div className="bg-tab/80 p-4 backdrop-blur-[2px]">
            <Button
              fullWidth
              color="primary"
              isLoading={isSubmitting}
              isDisabled={
                !lfgData ||
                isModesLoading ||
                isCategoriesLoading ||
                isSubmitting
              }
              onPress={onSubmit}
            >
              {id ? "Update LFG" : "Create LFG"}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default LFGBetterMatchingForm;

"use client";
import BottomSheet from "@/components/base/BottomSheet";
import Button from "@/components/base/Button";
import Countdown from "@/components/base/Countdown";
import type {
  BumpLFGTooSoonResponse,
  LFGDetailViewData,
} from "@/@types/lfg.type";
import { getApiErrorList } from "@/helpers/api-error";
import { useBumpLfgMutation } from "@/hooks/mutations/useBumpLfgMutation";
import { useDeleteLfgMutation } from "@/hooks/mutations/useDeleteLfgMutation";
import { addToast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";

type Props = {
  data: LFGDetailViewData;
};

const isBumpTooSoonResponse = (
  error: unknown,
): error is BumpLFGTooSoonResponse =>
  Boolean(
    error &&
    typeof error === "object" &&
    "detail" in error &&
    error.detail === "Too soon to bump again" &&
    "remaining_minutes" in error &&
    typeof error.remaining_minutes === "number",
  );

const MyLFGFooter = ({ data }: Props) => {
  const initialBumpSeconds = useMemo(
    () => Math.max(0, data.remainingBumpMinutes * 60),
    [data.remainingBumpMinutes],
  );
  const [remainingBumpSeconds, setRemainingBumpSeconds] =
    useState(initialBumpSeconds);
  const [isBumpLocked, setIsBumpLocked] = useState(!data.canBump);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openBumpedMsg, setOpenBumpedMsg] = useState(false);
  const router = useRouter();
  const bumpMutation = useBumpLfgMutation();
  const deleteLfgMutation = useDeleteLfgMutation();
  const isBumpDisabled = isBumpLocked || bumpMutation.isPending;

  const handleDelete = useCallback(async () => {
    if (deleteLfgMutation.isPending) {
      return;
    }

    try {
      const response = await deleteLfgMutation.mutateAsync();
      setOpenDeleteConfirm(false);
      addToast({
        title: "LFG deleted",
        description: response.detail,
        color: "success",
        severity: "success",
      });
      router.replace("/profile");
      router.refresh();
    } catch (error) {
      addToast({
        title: "Unable to delete LFG",
        description: getApiErrorList(
          error,
          "Failed to delete LFG. Please try again.",
        ).join(" "),
        color: "danger",
        severity: "danger",
      });
    }
  }, [deleteLfgMutation, router]);

  const handleBump = useCallback(async () => {
    if (isBumpDisabled) {
      return;
    }

    try {
      await bumpMutation.mutateAsync(data.id);
      setIsBumpLocked(true);
      setOpenBumpedMsg(true);
      router.refresh();
    } catch (error) {
      if (isBumpTooSoonResponse(error)) {
        setIsBumpLocked(true);
        setRemainingBumpSeconds(
          Math.max(0, Math.ceil(error.remaining_minutes * 60)),
        );

        addToast({
          title: error.detail,
          description: `Try again in ${error.remaining_minutes} minute${
            error.remaining_minutes === 1 ? "" : "s"
          }.`,
          color: "danger",
          severity: "danger",
        });
        router.refresh();
        return;
      }

      addToast({
        title: "Unable to bump LFG",
        description: getApiErrorList(
          error,
          "Failed to bump LFG. Please try again.",
        ).join(" "),
        color: "danger",
        severity: "danger",
      });
    }
  }, [bumpMutation, data.id, isBumpDisabled, router]);

  const handleNavigate = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <>
      <div className="flex flex-col border-t border-white/5 gap-3 p-4">
        <Button
          fullWidth
          isDisabled={isBumpDisabled}
          isLoading={bumpMutation.isPending}
          color="primary"
          onPress={handleBump}
        >
          {isBumpDisabled && !bumpMutation.isPending ? "Next Bump" : "Bump"}
          {remainingBumpSeconds > 0 ? (
            <Countdown
              key={remainingBumpSeconds}
              initial={remainingBumpSeconds}
              onEnd={() => {
                setRemainingBumpSeconds(0);
                setIsBumpLocked(false);
              }}
            />
          ) : null}
        </Button>
        <div className="flex gap-4">
          <Button
            fullWidth
            color="primary"
            className="bg-[#252932] flex-1"
            onPress={() => setOpenDeleteConfirm(true)}
            isDisabled={deleteLfgMutation.isPending}
          >
            Delete
          </Button>
          <Link href={`/lfg/${data.id}/edit`} className="flex-1">
            <Button fullWidth color="primary" className="bg-[#252932]">
              Edit
            </Button>
          </Link>
        </div>
      </div>
      <BottomSheet
        isOpen={openDeleteConfirm}
        onClose={() => {
          if (!deleteLfgMutation.isPending) {
            setOpenDeleteConfirm(false);
          }
        }}
      >
        <div className="flex flex-col gap-8 p-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Delete LFG</h3>
            <p>Are you sure you want to delete this LFG Post?</p>
          </div>

          <div className="flex gap-4 items-center">
            <Button
              fullWidth
              color="danger"
              isLoading={deleteLfgMutation.isPending}
              isDisabled={deleteLfgMutation.isPending}
              onPress={handleDelete}
            >
              Delete
            </Button>
            <Button
              fullWidth
              onPress={() => setOpenDeleteConfirm(false)}
              isDisabled={deleteLfgMutation.isPending}
              className="bg-[#252932] text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
      <BottomSheet
        isOpen={openBumpedMsg}
        title={<span className="flex gap-1 items-center">LFG Bumped 🚀</span>}
        description="Your post has been bumped to the top of the feed. Try browsing for similar posts to join while you wait for gamers to connect with you"
        confirmText="Browse Posts"
        confirmProps={{ color: "primary" }}
        onConfirm={handleNavigate}
        closeText="Dismiss"
        onClose={() => setOpenBumpedMsg(false)}
      />
    </>
  );
};

export default MyLFGFooter;

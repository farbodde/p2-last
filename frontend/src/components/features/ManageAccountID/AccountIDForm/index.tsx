import { useForm } from "react-hook-form";
import Button from "@/components/base/Button";
import InputController from "@/components/base/Form/InputController";
import AccountIDPlatformController from "./AccountIDPlatformController";
import type { AccountIDItemType } from "@/@types/accountID.type";
import { useCreateAccountIdMutation } from "@/hooks/mutations/useCreateAccountIdMutation";
import { getApiErrorList } from "@/helpers/api-error";
import { addToast } from "@heroui/react";
import { useRouter } from "next/navigation";

type AccountIDFormFields = {
  platform: AccountIDItemType | null;
  username: string;
};

const AccountIDForm = () => {
  const router = useRouter();
  const createAccountIdMutation = useCreateAccountIdMutation();
  const { control, handleSubmit } = useForm<AccountIDFormFields>({
    defaultValues: {
      platform: null,
      username: "",
    },
  });

  const onSubmit = handleSubmit(async ({ platform, username }) => {
    if (
      !platform?.id ||
      !username.trim() ||
      createAccountIdMutation.isPending
    ) {
      return;
    }

    try {
      const response = await createAccountIdMutation.mutateAsync({
        platform: platform.id,
        username: username.trim(),
      });

      addToast({
        title: "Account ID added",
        description: response.detail,
        color: "success",
        severity: "success",
      });
      router.replace("/profile/accountids");
      router.refresh();
    } catch (error) {
      addToast({
        title: "Unable to add Account ID",
        description: getApiErrorList(
          error,
          "Failed to create Account ID. Please try again.",
        ).join(" "),
        color: "danger",
        severity: "danger",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 p-4">
      <AccountIDPlatformController
        control={control}
        name="platform"
        rules={{ required: "Platform is required" }}
      />

      <InputController
        control={control}
        label="Account ID"
        name="username"
        rules={{
          required: "Account ID is required",
          validate: (value) =>
            value.trim().length > 0 || "Account ID is required",
        }}
      />

      <Button
        type="submit"
        color="primary"
        className="mt-auto"
        isLoading={createAccountIdMutation.isPending}
        isDisabled={createAccountIdMutation.isPending}
      >
        Save Changes
      </Button>
    </form>
  );
};

export default AccountIDForm;

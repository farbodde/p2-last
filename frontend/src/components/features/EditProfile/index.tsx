"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import EditProfileHeader from "./EditProfileHeader";
import EditProfileImage from "./EditProfileImage";
import InputController from "@/components/base/Form/InputController";
import { useForm, useWatch } from "react-hook-form";
import TextareaController from "@/components/base/Form/TextareaController";
import { GenderEnum } from "@/@types/general.type";
import clsx from "clsx";
import Button from "@/components/base/Button";
import BirthDatePickerController from "@/components/base/Form/BirthDatePickerController";
import LanguagePickerController from "@/components/base/Form/LanguagePickerController";
import LocationPickerController from "@/components/base/Form/LocationPickerController";
import Link from "next/link";
import BottomSheet from "@/components/base/BottomSheet";
import { FemaleIcon, MaleIcon } from "@/components/common/icons";
import Alert from "@/components/common/Alert";
import { getApiErrorList } from "@/helpers/api-error";
import { useUpdateProfileMutation } from "@/hooks/mutations/useProfileMutations";
import { useProfileQuery } from "@/hooks/queries/useProfileQuery";
import type {
  EditProfileFormValues,
  UpdateProfilePayload,
} from "@/@types/profile.type";
import { useRouter } from "next/navigation";
import LogoutBottomSheet from "./LogoutBottomSheet";

const formatBirthDateForForm = (value: string | null) => {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${year}.${Number(month)}.${Number(day)}`;
};

const formatBirthDateForApi = (value: string) => {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split(".");

  if (!year || !month || !day) {
    return value;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const EditProfile = () => {
  const router = useRouter();
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string[]>([]);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<EditProfileFormValues>({
    defaultValues: {
      display_name: "",
      username: "",
      about_me: "",
      gender: GenderEnum.PREFER_NOT_SAY,
      date_of_birth: "",
      languages: [],
      location: "",
    },
  });
  const gender = useWatch({ control, name: "gender" });
  const {
    data: profile,
    error,
    isLoading: isProfileLoading,
  } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const isBusy =
    isProfileLoading || isSubmitting || updateProfileMutation.isPending;
  const errorMessage = error
    ? getApiErrorList(
        error,
        "Failed to load profile information. Please try again.",
      )[0]
    : "";
  const profileImagePreview = useMemo(
    () => (profileImageFile ? URL.createObjectURL(profileImageFile) : null),
    [profileImageFile],
  );
  const coverImagePreview = useMemo(
    () => (coverImageFile ? URL.createObjectURL(coverImageFile) : null),
    [coverImageFile],
  );

  const genderOptions = [
    {
      key: GenderEnum.MALE,
      label: "Male",
      icon: <MaleIcon className="w-9 h-9" />,
    },
    {
      key: GenderEnum.FEMALE,
      label: "Female",
      icon: <FemaleIcon className="w-9 h-9" />,
    },
    {
      key: GenderEnum.PREFER_NOT_SAY,
      label: "Prefer not to say",
    },
  ];

  const handleDelete = useCallback(() => {
    setOpenDeleteConfirm(false);
  }, []);

  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  useEffect(() => {
    return () => {
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      display_name: profile.displayName,
      username: profile.username ?? "",
      about_me: profile.aboutMe,
      gender: profile.gender,
      date_of_birth: formatBirthDateForForm(profile.dateOfBirth),
      languages: profile.languages,
      location: profile.location,
    });
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError([]);

    if (values.languages.length > 7) {
      setSubmitError(["You can select up to 7 languages."]);
      return;
    }

    const hasInvalidLanguageCode = values.languages.some(
      (language) => language.length < 2 || language.length > 3,
    );

    if (hasInvalidLanguageCode) {
      setSubmitError(["Each language code must be 2 or 3 characters long."]);
      return;
    }

    const payload: UpdateProfilePayload = {
      ...values,
      date_of_birth: formatBirthDateForApi(values.date_of_birth),
      profile_image: profileImageFile,
      cover_image: coverImageFile,
    };

    try {
      const response = await updateProfileMutation.mutateAsync(payload);
      setProfileImageFile(null);
      setCoverImageFile(null);
      reset({
        display_name: response.displayName,
        username: response.username ?? "",
        about_me: response.aboutMe,
        gender: response.gender,
        date_of_birth: formatBirthDateForForm(response.dateOfBirth),
        languages: response.languages,
        location: response.location,
      });
      router.back();
    } catch (error) {
      setSubmitError(
        getApiErrorList(
          error,
          "Failed to update profile information. Please try again.",
        ),
      );
    }
  });

  return (
    <section className="flex flex-col gap-4">
      <EditProfileHeader isSubmitting={isSubmitting} />
      <section className="p-4 flex flex-col gap-8">
        {errorMessage ? (
          <Alert
            type="error"
            title="Unable to load profile"
            message={errorMessage}
            dismissible={false}
          />
        ) : null}
        {submitError.length > 0 ? (
          <Alert
            type="error"
            title="Unable to update profile"
            message={
              <ul className="list-disc pl-5">
                {submitError.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            }
            dismissible={false}
          />
        ) : null}
        <EditProfileImage
          profileImage={profileImagePreview ?? profile?.profileImage}
          coverImage={coverImagePreview ?? profile?.coverImage}
          isDisabled={isBusy}
          onProfileImageChange={setProfileImageFile}
          onCoverImageChange={setCoverImageFile}
        />
        <form
          id="profileForm"
          onSubmit={onSubmit}
          className="flex flex-col gap-6"
        >
          <InputController
            control={control}
            name="display_name"
            label="Display Name"
            isDisabled={isBusy}
            rules={{
              required: "Display Name is required",
              minLength: {
                value: 5,
                message: "Display Name must be at least 5 characters",
              },
            }}
          />

          <InputController
            control={control}
            name="username"
            label="Username"
            isDisabled={isBusy}
            rules={{
              required: "Username is required",
              minLength: {
                value: 5,
                message: "Username must be at least 5 characters",
              },
            }}
          />

          <TextareaController
            control={control}
            name="about_me"
            label="About Me"
            className="resize-none"
            rows={5}
            isDisabled={isBusy}
          />

          <div className="flex flex-col gap-2">
            <span className="text-white/50 font-medium">Gender</span>
            <div className="flex gap-4">
              {genderOptions.map((opt) => (
                <div
                  key={opt.key}
                  onClick={() => setValue("gender", opt.key)}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-2 border p-4 text-center font-medium text-sm rounded-xl w-32 max-w-1/3 transition aspect-square",
                    {
                      "border-white/10 text-white/60 hover:bg-white/5 cursor-pointer":
                        opt.key !== gender && !isBusy,
                      "border-primary/90 bg-primary/90": opt.key === gender,
                      "opacity-60 pointer-events-none": isBusy,
                    },
                  )}
                >
                  {opt.icon}
                  {opt.label}
                </div>
              ))}
            </div>
          </div>

          <BirthDatePickerController
            control={control}
            name="date_of_birth"
            label="Date of Birth"
            isDisabled={isBusy}
          />

          <LanguagePickerController
            control={control}
            name="languages"
            label="Language"
            isDisabled={isBusy}
          />

          <LocationPickerController
            control={control}
            name="location"
            label="Location"
            isDisabled={isBusy}
          />
        </form>

        <section className="flex flex-col gap-4 border-t border-black/20 py-8">
          <Button
            as={Link}
            href="/profile/change-password"
            className="bg-[#252932] text-white/90 text-base h-12"
          >
            Change Password
          </Button>
          <Button
            as={Link}
            href="/profile/blocked-users"
            className="bg-[#252932] text-white/90 text-base h-12"
          >
            Block Users
          </Button>
          <Button
            className="bg-[#252932] text-white/90 text-base h-12"
            onPress={() => setOpenLogoutConfirm(true)}
          >
            Log Out
          </Button>

          <Button
            variant="light"
            className="text-white/60 w-fit mx-auto"
            onPress={() => setOpenDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        </section>
      </section>

      <LogoutBottomSheet
        isOpen={openLogoutConfirm}
        onClose={() => setOpenLogoutConfirm(false)}
      />
      <BottomSheet
        isOpen={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
      >
        <div className="flex flex-col gap-8 p-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Delete Account</h3>
            <p>Are you sure you want to delete your account?</p>
          </div>

          <div className="flex gap-4 items-center">
            <Button fullWidth color="danger" onPress={handleDelete}>
              Delete
            </Button>
            <Button
              fullWidth
              onPress={() => setOpenDeleteConfirm(false)}
              className="bg-[#252932] text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
};

export default EditProfile;

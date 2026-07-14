import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";
import type {
  BlockedUserResponse,
  BlockedUsersPageData,
  BlockedUserViewData,
  ProfileResponse,
  ProfileViewData,
  PublicProfileResponse,
  PublicProfileViewData,
  UpdateProfilePayload,
} from "@/@types/profile.type";
import { GenderEnum } from "@/@types/general.type";
import { fetchWithAuth } from "./auth.service";

const parseProfileErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getProfileErrorMessage = (data: any, fallbackMessage: string) => {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  return fallbackMessage;
};

export const resolveProfileAssetUrl = (path: string | null) => {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${apiConfig.baseUrl}${path}`;
};

export const mapProfileResponse = (
  profile: ProfileResponse,
): ProfileViewData => ({
  email: profile.email,
  displayName: profile.display_name,
  username: profile.username,
  profileImage: resolveProfileAssetUrl(profile.profile_image),
  coverImage: resolveProfileAssetUrl(profile.cover_image),
  aboutMe: profile.about_me,
  gender:
    profile.gender === "male"
      ? GenderEnum.MALE
      : profile.gender === "female"
        ? GenderEnum.FEMALE
        : GenderEnum.PREFER_NOT_SAY,
  dateOfBirth: profile.date_of_birth,
  location: profile.location,
  languages: profile.languages,
  profileCompletion: profile.profile_completion,
});

export const mapPublicProfileResponse = (
  profile: PublicProfileResponse,
): PublicProfileViewData => ({
  id: profile.id,
  username: profile.username,
  displayName: profile.display_name,
  profileImage: resolveProfileAssetUrl(profile.profile_image),
  coverImage: resolveProfileAssetUrl(profile.cover_image),
  aboutMe: profile.about_me,
  gender: profile.gender,
  location: profile.location,
  languages: profile.languages,
  isOnline: profile.is_online,
});

const mapBlockedUserResponse = (
  user: BlockedUserResponse,
): BlockedUserViewData => ({
  id: user.id,
  username: user.username,
  displayName: user.display_name,
  profileImage: resolveProfileAssetUrl(user.profile_image),
});

const mapGenderToApiValue = (gender: GenderEnum): ProfileResponse["gender"] => {
  if (gender === GenderEnum.MALE) {
    return "male";
  }

  if (gender === GenderEnum.FEMALE) {
    return "female";
  }

  return "none";
};

const createProfileFormData = (payload: UpdateProfilePayload) => {
  const formData = new FormData();

  formData.append("display_name", payload.display_name);
  formData.append("username", payload.username);
  formData.append("about_me", payload.about_me);
  formData.append("gender", mapGenderToApiValue(payload.gender));
  formData.append("date_of_birth", payload.date_of_birth);
  formData.append("location", payload.location);

  payload.languages.forEach((language) => {
    formData.append("languages[]", language);
  });

  if (payload.profile_image) {
    formData.append("profile_image", payload.profile_image);
  }

  if (payload.cover_image) {
    formData.append("cover_image", payload.cover_image);
  }

  return formData;
};

export const getProfile = async (): Promise<ProfileViewData> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.auth.profile}`,
  );

  if (!response.ok) {
    const errorData = await parseProfileErrorResponse(response);

    return Promise.reject(
      getProfileErrorMessage(
        errorData,
        "Failed to load profile information. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as ProfileResponse;

  return mapProfileResponse(data);
};

export const getPublicProfile = async (
  username: string,
): Promise<PublicProfileViewData> => {
  const response = await fetch(
    `${apiConfig.baseUrl}${apiRoutes.auth.publicProfile(username)}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseProfileErrorResponse(response);

    return Promise.reject(
      getProfileErrorMessage(
        errorData,
        response.status === 404
          ? "This profile could not be found."
          : "Failed to load profile information. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as PublicProfileResponse;

  return mapPublicProfileResponse(data);
};

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<ProfileViewData> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.auth.profile}`,
    {
      method: "PATCH",
      body: createProfileFormData(payload),
    },
  );

  if (!response.ok) {
    const errorData = await parseProfileErrorResponse(response);

    if (response.status === 400 && errorData) {
      throw errorData;
    }

    return Promise.reject(
      getProfileErrorMessage(
        errorData,
        "Failed to update profile information. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as ProfileResponse;

  return mapProfileResponse(data);
};

export const getBlockedUsers = async (
  page = 1,
): Promise<BlockedUsersPageData> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.auth.blockedUsers}?page=${page}`,
  );

  if (!response.ok) {
    const errorData = await parseProfileErrorResponse(response);

    return Promise.reject(
      getProfileErrorMessage(
        errorData,
        "Failed to load blocked users. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as {
    data?: BlockedUserResponse[];
    count?: number;
    totalPage?: number;
  };
  const items = Array.isArray(data.data) ? data.data : [];
  const count =
    typeof data.count === "number" && Number.isFinite(data.count)
      ? data.count
      : items.length;
  const totalPage =
    typeof data.totalPage === "number" &&
    Number.isFinite(data.totalPage) &&
    data.totalPage > 0
      ? data.totalPage
      : 1;
  const currentPage = Math.min(Math.max(page, 1), totalPage);

  return {
    items: items.map(mapBlockedUserResponse),
    count,
    totalPage,
    currentPage,
  };
};

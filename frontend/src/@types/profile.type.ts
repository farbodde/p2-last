import { GenderEnum } from "./general.type";

export type ProfileApiGender = "male" | "female" | "none";

export type ProfileResponse = {
  email: string;
  display_name: string;
  username: string | null;
  profile_image: string | null;
  cover_image: string | null;
  about_me: string;
  gender: ProfileApiGender;
  date_of_birth: string | null;
  location: string;
  languages: string[];
  profile_completion: number;
};

export type ProfileViewData = {
  email: string;
  displayName: string;
  username: string | null;
  profileImage: string | null;
  coverImage: string | null;
  aboutMe: string;
  gender: GenderEnum;
  dateOfBirth: string | null;
  location: string;
  languages: string[];
  profileCompletion: number;
};

export type PublicProfileResponse = {
  id: number;
  username: string;
  display_name: string;
  profile_image: string | null;
  cover_image: string | null;
  about_me: string;
  gender: ProfileApiGender;
  location: string;
  languages: string[];
  is_online: boolean;
};

export type PublicProfileViewData = {
  id: number;
  username: string;
  displayName: string;
  profileImage: string | null;
  coverImage: string | null;
  aboutMe: string;
  gender: PublicProfileResponse["gender"];
  location: string;
  languages: string[];
  isOnline: boolean;
};

export type BlockedUserResponse = {
  id: number;
  username: string | null;
  display_name: string;
  profile_image: string | null;
};

export type BlockedUserViewData = {
  id: number;
  username: string | null;
  displayName: string;
  profileImage: string | null;
};

export type BlockedUsersPageData = {
  items: BlockedUserViewData[];
  count: number;
  totalPage: number;
  currentPage: number;
};

export type EditProfileFormValues = {
  display_name: string;
  username: string;
  about_me: string;
  gender: GenderEnum;
  date_of_birth: string;
  languages: string[];
  location: string;
};

export type UpdateProfilePayload = EditProfileFormValues & {
  profile_image?: File | null;
  cover_image?: File | null;
};

export enum OnlineStatusEnum {
  ONLINE = "online",
  OFFLINE = "offline",
  AWAY = "away",
}

export enum GenderEnum {
  MALE = "male",
  FEMALE = "female",
  PREFER_NOT_SAY = "prefer_not_say",
}

export type ModeColor = "light" | "dark";

export type Country = {
  code: string;
  name: string;
};

export type CountryListResponse = Country[];

export type AccountIDItemType = {
  id?: number;
  key: string;
  label: string;
  icon: string | React.ReactNode;
};

export type FilterConfigPlatform = {
  id: number;
  title: string;
  logo: string;
};
export type FilterConfigCountry = {
  code: string;
  name: string;
};

export type FilterConfigResponse = {
  platforms: FilterConfigPlatform[];
  countries: FilterConfigCountry[];
  [key: string]: unknown;
};

export type CreateAccountIDPayload = {
  platform: number;
  username: string;
};

export type CreateAccountIDResponse = {
  detail: "AccountID created successfully";
};

export type AccountID = {
  id: number;
  platform: number;
  username: string;
  created_at: string;
};

export type AccountIDListResponse = AccountID[];

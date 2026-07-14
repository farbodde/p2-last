export type SignupPayload = {
  email: string;
  display_name: string;
  password: string;
  confirm_password: string;
};

export type SignupResponse = {
  message: string;
};

export enum UserRole {
  PLAYER = "player",
  YOUTUBER = "youtuber",
  PREMIUM_USER = "premium_user",
  ADMIN = "admin",
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type GoogleLoginPayload = {
  token: string;
};

export type AuthUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_staff: boolean;
  is_superuser: boolean;
};

export type LoginResponse = {
  refresh: string;
  access: string;
  user: AuthUser;
};

export type RefreshTokenPayload = {
  refresh: string;
};

export type RefreshTokenResponse = {
  access: string;
};

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type ChangePasswordResponse = {
  message: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

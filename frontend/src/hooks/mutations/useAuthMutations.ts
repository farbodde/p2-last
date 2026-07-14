"use client";

import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  GoogleLoginPayload,
  LoginPayload,
  SignupPayload,
} from "@/types/auth.types";
import { useMutation } from "@tanstack/react-query";
import {
  changePassword,
  forgotPassword,
  googleLogin,
  login,
  signup,
} from "@/services/auth.service";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });

export const useGoogleLoginMutation = () =>
  useMutation({
    mutationFn: (payload: GoogleLoginPayload) => googleLogin(payload),
  });

export const useSignupMutation = () =>
  useMutation({
    mutationFn: (payload: SignupPayload) => signup(payload),
  });

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });

import * as yup from "yup";

import type { Role } from "@/types/domain";

import { emailSchema, nameSchema, passwordSchema, phoneSchema } from "./shared";

export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required("Enter your password.").max(200, "That password is too long."),
});
const ROLES: Role[] = ["student", "teacher", "admin"];

/** Which login page it came from: each only accepts its own role. */
export const loginAsSchema = loginSchema.shape({
  role: yup.mixed<Role>().oneOf(ROLES).required(),
});
export type LoginInput = yup.InferType<typeof loginSchema>;

/** No password here: it is chosen from the emailed link, which proves the email is theirs. */
export const signupSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});
export type SignupInput = yup.InferType<typeof signupSchema>;

export const forgotPasswordSchema = yup.object({ email: emailSchema });

export const setPasswordSchema = yup.object({
  token: yup.string().required("This link isn't complete. Open it again from your email."),
  password: passwordSchema,
  confirm: yup
    .string()
    .required("Type the password again.")
    .oneOf([yup.ref("password")], "Passwords don't match."),
});

/** For actions that take no input. */
export const emptySchema = yup.object({});

export const changePasswordSchema = yup.object({
  current: yup
    .string()
    .required("Enter your current password.")
    .max(200, "That password is too long."),
  next: passwordSchema,
  confirm: yup
    .string()
    .required("Confirm your new password.")
    .oneOf([yup.ref("next")], "Passwords don't match."),
});
export type ChangePasswordInput = yup.InferType<typeof changePasswordSchema>;

export const profileSchema = yup.object({ name: nameSchema, phone: phoneSchema });
export type ProfileInput = yup.InferType<typeof profileSchema>;

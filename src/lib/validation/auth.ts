import * as yup from "yup";

import { emailSchema, nameSchema, passwordSchema, phoneSchema } from "./shared";

export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required("Enter your password."),
});
export type LoginInput = yup.InferType<typeof loginSchema>;

export const signupSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});
export type SignupInput = yup.InferType<typeof signupSchema>;

export const changePasswordSchema = yup.object({
  current: yup.string().required("Enter your current password."),
  next: passwordSchema,
  confirm: yup
    .string()
    .required("Confirm your new password.")
    .oneOf([yup.ref("next")], "Passwords don't match."),
});
export type ChangePasswordInput = yup.InferType<typeof changePasswordSchema>;

export const profileSchema = yup.object({ name: nameSchema, phone: phoneSchema });
export type ProfileInput = yup.InferType<typeof profileSchema>;

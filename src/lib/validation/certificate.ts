import * as yup from "yup";

export const verifyCertificateSchema = yup.object({
  code: yup
    .string()
    .trim()
    .uppercase()
    .required("Enter the certificate code.")
    .matches(/^CERT-[A-Z0-9]{6,12}$/, "Codes look like CERT-7KQ2M9XA."),
});

/** The email the student is signed in to Zoom with. */
export const joinClassSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .required("Enter your Zoom email.")
    .email("Enter a valid email address."),
});

/** The action also gets the secret from the personal link. */
export const joinSchema = joinClassSchema.shape({
  token: yup
    .string()
    .required()
    .matches(/^[a-z0-9]{10,64}$/),
});

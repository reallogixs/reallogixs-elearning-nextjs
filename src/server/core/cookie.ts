/** The __Host- prefix (HTTPS only) stops other subdomains setting this cookie. */
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-rlx_session" : "rlx_session";

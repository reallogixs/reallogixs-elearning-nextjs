import localFont from "next/font/local";

/*
 * The certificate's own fonts. The PDF embeds these same files (src/assets/fonts), so the
 * download matches the page.
 */
export const certificateSerif = localFont({
  src: [
    { path: "../../assets/fonts/CormorantGaramond-SemiBold.ttf", weight: "600", style: "normal" },
    {
      path: "../../assets/fonts/CormorantGaramond-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-cert-serif",
  display: "swap",
  preload: false,
});

export const certificateSans = localFont({
  src: [
    { path: "../../assets/fonts/Poppins-Regular.ttf", weight: "400" },
    { path: "../../assets/fonts/Poppins-Medium.ttf", weight: "500" },
    { path: "../../assets/fonts/Poppins-SemiBold.ttf", weight: "600" },
  ],
  variable: "--font-cert-sans",
  display: "swap",
  preload: false,
});

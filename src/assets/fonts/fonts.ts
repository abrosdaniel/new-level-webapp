import { Jost } from "next/font/google";

export const fontJost = Jost({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-jost",
});

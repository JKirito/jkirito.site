import type { Metadata } from "next";
import { Exo_2, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const displayFont = Exo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Arpit Singh — Full-Stack Developer & AI Product Builder",
  description:
    "Portfolio of Arpit Singh. Full-Stack Developer and AI Product Builder based in Melbourne, Australia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${monoFont.variable}`}>
        {children}
      </body>
    </html>
  );
}

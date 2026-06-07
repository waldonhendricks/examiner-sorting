import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import "@fontsource/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Examiner Finder SA",
  description: "Find suitable thesis examiners from South African universities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-script" strategy="beforeInteractive">
          {`try {
            const storedTheme = window.localStorage.getItem("theme");
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
              document.documentElement.classList.add("dark");
            }
          } catch (error) {
            console.warn("Theme initialization failed", error);
          }`}
        </Script>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

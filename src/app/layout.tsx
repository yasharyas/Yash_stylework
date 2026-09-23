import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lead Intake",
  description: "Lead intake service for Meta Ads webhook leads",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-sm font-semibold text-white">
              L
            </span>
            <span className="text-sm font-semibold text-gray-900">
              Lead Intake
            </span>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}

import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import IconLinkButton from "@/app/components/IconLinkButton";
import GithubIcon from "@/app/components/GithubIcon";
import ClientDependencyContainer from "@/app/containers/ClientDependencyContainer";
import NpmIcon from "@/app/components/NpmIcon";

const inter = Inter({ subsets: ["latin"] });

const title =
  "⛓️return-fetch :: A simple and powerful high order function to extend fetch";
const description =
  "The modern fetch interceptor for browser and Node.js, especially for Next.js.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "fetch intercept",
    "fetch",
    "interceptor",
    "fetch-intercept",
    "request",
    "response",
    "baseURL",
    "baseUrl",
    "default headers",
    "header",
    "nextjs",
  ],
  icons: {
    icon: [
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    apple: {
      sizes: "180x180",
      url: "/apple-touch-icon.png",
    },
  },
  themeColor: "#ffffff",
  manifest: "/site.webmanifest",
  openGraph: {
    title,
    description,
    images: ["/meta.png"],
  },
  twitter: {
    title,
    description,
    card: "summary_large_image",
    images: ["/meta.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={"scroll-smooth"}>
      <body className={inter.className}>
        <header className={"flex justify-end p-2"}>
          <IconLinkButton
            className={"text-black hover:text-red-500"}
            aria-label="Open on npmjs"
            href="https://npmjs.com/package/return-fetch"
          >
            <NpmIcon />
          </IconLinkButton>
          <IconLinkButton
            className={"text-black hover:text-black"}
            aria-label="Open on GitHub"
            href="https://github.com/deer-develop/return-fetch"
          >
            <GithubIcon />
          </IconLinkButton>
        </header>
        <ClientDependencyContainer />
        {children}
      </body>
    </html>
  );
}

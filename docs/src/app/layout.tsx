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
  "A simple and powerful high order function to extend `fetch` by implementing request, response interceptors, `baseURL`, and default headers. Write your own functions to extend `fetch` and compose functions.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: ["/meta.png"],
  },
  twitter: {
    title,
    description,
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

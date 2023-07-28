import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import IconLinkButton from "@/app/components/IconLinkButton";
import GithubIcon from "@/app/components/GithubIcon";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "⛓️return-fetch :: A simple and powerful high order function to extend fetch",
  description:
    "A simple and powerful high order function to extend `fetch` by implementing request, response interceptors, `baseURL`, and default headers. Write your own functions to extend `fetch` and compose functions.",
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
            aria-label="Open on GitHub"
            href="https://github.com/deer-develop/return-fetch"
          >
            <GithubIcon />
          </IconLinkButton>
        </header>
        {children}
      </body>
    </html>
  );
}

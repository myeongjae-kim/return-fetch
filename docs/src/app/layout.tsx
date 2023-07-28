import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

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
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

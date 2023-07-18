import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import Toaster from "./toaster";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ChatFn - chat with Functions",
  description:
    "Chat with Functions. Built with OpenAI Functions and Vercel AI SDK.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <script
        async
        src="https://umami-lac-five.vercel.app/script.js"
        data-website-id="15edf78f-00f6-4590-a1fc-a062bf95c606"
      ></script>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
      <Analytics />
    </html>
  );
}

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CF Helper",
  description: "A tool built with Next.js and Gemini API to fetch and explain Codeforces solutions using web scraping via Cheerio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

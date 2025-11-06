import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tire Metadata Operations Studio",
  description: "Orchestrate tire test metadata from request to evaluation and results."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-100 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import "./globals.css";

const gujaratiFont = Noto_Sans_Gujarati({
  variable: "--font-noto-sans-gujarati",
  subsets: ["gujarati"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "સેવા સેતુ | SevaSetu",
  description: "આવક પ્રમાણપત્ર અરજીઓ માટેનું કાર્યપ્રવાહ વ્યવસ્થાપન પ્લેટફોર્મ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="gu" className={`${gujaratiFont.variable} min-h-full antialiased`}>
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}

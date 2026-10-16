import type { Metadata } from "next";
import { Bitter, Rubik } from "next/font/google";
import "./globals.css";

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monitorização Leça",
  description: "Monitorização de espécies invasoras ao longo do Rio Leça",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${bitter.variable} ${rubik.variable}`}>
      <body>{children}</body>
    </html>
  );
}

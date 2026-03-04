import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "./providers";
import "../index.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://littlewondersgifts.com"),
  title: {
    default: "Little Wonders Gifts — Ръчно изработени подаръци за бебета и деца",
    template: "%s | Little Wonders Gifts",
  },
  description:
    "Уникални ръчно изработени подаръци за бебета и деца — керамични фигури, клипсове за биберон, подаръчни комплекти.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Little Wonders Gifts — Ръчно изработени подаръци за бебета и деца",
    description:
      "Уникални ръчно изработени подаръци за бебета и деца — керамични фигури, клипсове за биберон, подаръчни комплекти.",
    url: "/",
    type: "website",
  },
  twitter: {
    title: "Little Wonders Gifts — Ръчно изработени подаръци за бебета и деца",
    description:
      "Уникални ръчно изработени подаръци за бебета и деца — керамични фигури, клипсове за биберон, подаръчни комплекти.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

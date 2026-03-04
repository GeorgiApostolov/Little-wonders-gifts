import type { Metadata } from "next";
import About from "@/views/About";

export const metadata: Metadata = {
  title: "За нас — Little Wonders Gifts",
  description:
    "Научи повече за Little Wonders Gifts — семеен бранд за ръчно изработени подаръци за бебета и деца.",
  alternates: {
    canonical: "/za-nas",
  },
};

export default function AboutPage() {
  return <About />;
}

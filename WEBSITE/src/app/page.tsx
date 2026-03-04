import type { Metadata } from "next";
import Index from "@/views/Index";

export const metadata: Metadata = {
  title: "Little Wonders Gifts — Ръчно изработени подаръци за бебета и деца",
  description:
    "Уникални ръчно изработени подаръци за бебета и деца — керамични фигури, клипсове за биберон, подаръчни комплекти. Създадени с любов.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <Index />;
}

import type { Metadata } from "next";
import Services from "@/views/Services";

export const metadata: Metadata = {
  title: "Услуги — Little Wonders Gifts",
  description:
    "Персонализирани подаръци, керамични фигури, клипсове за биберон с име и подаръчни комплекти.",
  alternates: {
    canonical: "/uslugi",
  },
};

export default function ServicesPage() {
  return <Services />;
}

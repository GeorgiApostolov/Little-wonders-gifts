import type { Metadata } from "next";
import Services from "@/views/Services";

export const metadata: Metadata = {
  title: "Услуги — Little Wonders Gifts",
  description:
    "Клипсове за биберон, рамка за снимка с име по желание, декоративни платформи, кръгли платформи и кубчета за украса.",
  alternates: {
    canonical: "/uslugi",
  },
};

export default function ServicesPage() {
  return <Services />;
}

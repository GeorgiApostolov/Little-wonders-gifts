import type { Metadata } from "next";
import Contacts from "@/views/Contacts";

export const metadata: Metadata = {
  title: "Контакти — Little Wonders Gifts",
  description:
    "Свържи се с Little Wonders Gifts за персонализирани подаръци за бебета и деца.",
  alternates: {
    canonical: "/kontakti",
  },
};

export default function ContactsPage() {
  return <Contacts />;
}

import type { Metadata } from "next";
import Gallery from "@/views/Gallery";

export const metadata: Metadata = {
  title: "Галерия — Little Wonders Gifts",
  description:
    "Разгледай нашата галерия с ръчно изработени подаръци за бебета — керамични фигури, клипсове за биберон, подаръчни комплекти.",
  alternates: {
    canonical: "/galeriya",
  },
};

export default function GalleryPage() {
  return <Gallery />;
}

import type { Metadata } from "next";
import { ContactClient } from "@/components/features/contact/ContactClient";

export const metadata: Metadata = {
  title: "Contact Support",
  description:
    "Have questions about room reservations, listing a property, or technical support? Contact our residential support team.",
};

export default function ContactPage() {
  return <ContactClient />;
}

import type { Metadata } from "next";
import { ContactClient } from "@/components/features/contact/ContactClient";

import { getAppUrl } from "@/lib/utils";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Contact Support",
  description:
    "Have questions about room reservations, listing a property, or technical support? Contact our residential support team.",
  openGraph: {
    title: "Contact Support | Nestly",
    description:
      "Have questions about room reservations, listing a property, or technical support? Contact our residential support team.",
    url: `${appUrl}/contact`,
  },
};

export default function ContactPage() {
  return <ContactClient />;
}

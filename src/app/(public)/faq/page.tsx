import type { Metadata } from "next";
import { FaqClient } from "@/components/features/faq/FaqClient";

import { getAppUrl } from "@/lib/utils";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Everything you need to know about viewings, leases, roommate compatibility, Stripe payments, and maintenance requests.",
  openGraph: {
    title: "Frequently Asked Questions | Nestly",
    description:
      "Everything you need to know about viewings, leases, roommate compatibility, Stripe payments, and maintenance requests.",
    url: `${appUrl}/faq`,
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
